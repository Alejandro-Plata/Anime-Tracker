import type { Request, Response } from "express";
import { Users } from "../models/AllModels.js";
import { checkPassword, hashPassword } from "../utils/auth.js";
import { generateJWT } from "../utils/jwt.js";

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, username } = req.body; // Extraemos explícitamente los campos

            // 1. Prevenir duplicados (Solo por email como pediste)
            const userExists = await Users.findOne({ where: { username } });

            if (userExists) {
                const error = new Error('El usuario ya está registrado');
                return res.status(409).json({ error: error.message });
            }

            // 2. Crear la instancia del usuario (Solo con datos permitidos)
            // Es más seguro que pasar req.body completo
            const user = new Users({ password, username });

            // 3. Hashear la contraseña 
            user.password = await hashPassword(password);

            // 4. Guardar en BD
            await user.save();

            const token = generateJWT(user.id);

            return res.status(201).json({
                token: token
            })

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error en el servidor al crear la cuenta' });
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;

            // 1. Buscar usuario
            const user = await Users.findOne({ where: { username } });

            if (!user) {
                const error = new Error('Usuario no encontrado');
                return res.status(404).json({ error: error.message });
            }

            // 2. Verificar contraseña (user.password ya es el hash de la BD)
            const isPasswordCorrect = await checkPassword(password, user.password);

            if (!isPasswordCorrect) {
                const error = new Error('Contraseña incorrecta');
                return res.status(401).json({ error: error.message });
            }

            // 3. Generar JWT
            const token = generateJWT(user.id);

            // 4. Configurar Cookie (Solo para web, el navegador gestiona automáticamente las cookies)
            // secure: true solo funciona en HTTPS. Si estás en localhost sin SSL, fallará.
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Solo true en producción
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 días (en milisegundos)
            });

            // Devuelve el token para android
            res.status(201).json({ 
                token: token, 
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Hubo un error en el servidor al iniciar sesión' });
        }
    }

    static user = async (req: Request, res: Response) => {
        // Nota: Para que req.user funcione en TypeScript, necesitas extender la definición de Express
        // o usar (req as any).user si tienes prisa y el middleware de auth ya lo inyectó.
        return res.json((req as any).user);
    }

    static logout = (req: Request, res: Response) => {
        // Instruye al navegador para borrar la cookie 'token'
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({ message: 'Sesión cerrada correctamente' });
    }
}