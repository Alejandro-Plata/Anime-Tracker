import type { Request, Response } from "express";
import { Users } from "../models/AllModels.js";
import { checkPassword, hashPassword } from "../utils/auth.js";
import { generateJWT } from "../utils/jwt.js";
import { Op, where, fn, col } from "sequelize";
import { randomInt } from "node:crypto";
import { sendResetCode } from "../utils/email.js";

const CODE_MINUTES = 15;
const MAX_ATTEMPTS = 5;

// El email se compara sin distinguir mayúsculas (Op.iLike trataría "_" y "%" como comodines)
const findByEmail = (email: string) =>
    Users.findOne({ where: where(fn('lower', col('email')), email.trim().toLowerCase()) });

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, username, email } = req.body; // Extraemos explícitamente los campos

            // Prevenir duplicados 
            const userExists = await Users.findOne({ where: { [Op.or]: [{ username }, { email }] } });

            if (userExists) {
                const error = new Error('El usuario ya está registrado');
                return res.status(409).json({ error: error.message });
            }

            const user = new Users({ password, username, email });

            user.password = await hashPassword(password);

            await user.save();

            const token = generateJWT(user.id);

            return res.status(201).json({
                message: 'Cuenta creada exitosamente',
                token
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error en el servidor al crear la cuenta' });
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;

            const user = await Users.findOne({ where: { username } });

            if (!user) {
                const error = new Error('Usuario no encontrado');
                return res.status(404).json({ error: error.message });
            }

            const isPasswordCorrect = await checkPassword(password, user.password);

            if (!isPasswordCorrect) {
                const error = new Error('Contraseña incorrecta');
                return res.status(401).json({ error: error.message });
            }

            const token = generateJWT(user.id);

            return res.status(200).json({
                message: 'Login exitoso',
                token
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error en el servidor al iniciar sesión' });
        }
    }

    /* Paso 1: el usuario pide el código */
    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const user = await findByEmail(req.body.email);

            if (user) {
                // randomInt es criptográficamente seguro (Math.random no lo es). Siempre 6 dígitos
                const code = String(randomInt(100000, 1000000));
                user.resetCode = await hashPassword(code);
                user.resetCodeExpires = new Date(Date.now() + CODE_MINUTES * 60 * 1000);
                user.resetAttempts = 0;
                await user.save();
                await sendResetCode(user.email, code);
            }

            // Respuesta idéntica exista o no el correo, para que nadie pueda averiguar qué cuentas existen
            return res.json({ message: 'Si el correo está registrado, recibirás un código de 6 dígitos.' });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'No se pudo enviar el correo. Inténtalo de nuevo más tarde' });
        }
    }

    /* Paso 2: el usuario manda el código y la nueva contraseña */
    static resetPassword = async (req: Request, res: Response) => {
        try {
            const { email, code, password } = req.body;
            const user = await findByEmail(email);

            // Mismo mensaje para cualquier fallo: no revelamos si falló el correo, el código o la caducidad
            const invalido = () => res.status(400).json({ error: 'Código incorrecto o caducado' });

            if (!user || !user.resetCode || !user.resetCodeExpires
                || user.resetCodeExpires < new Date() || user.resetAttempts >= MAX_ATTEMPTS) {
                return invalido();
            }

            if (!(await checkPassword(String(code), user.resetCode))) {
                user.resetAttempts += 1;
                await user.save();
                return invalido();
            }

            user.password = await hashPassword(password);
            // El código es de un solo uso: lo borramos al usarlo
            user.resetCode = null;
            user.resetCodeExpires = null;
            user.resetAttempts = 0;
            await user.save();

            return res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error en el servidor al cambiar la contraseña' });
        }
    }

    static user = async (req: Request, res: Response) => {
        return res.json((req as any).user);
    }

    static logout = (req: Request, res: Response) => {
        res.json({ message: 'Sesión cerrada correctamente' });
    }
}