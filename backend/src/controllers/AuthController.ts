import type { Request, Response } from "express";
import { Users } from "../models/AllModels.js";
import { checkPassword, hashPassword } from "../utils/auth.js";
import { generateJWT } from "../utils/jwt.js";
import { Op } from "sequelize";

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

    static user = async (req: Request, res: Response) => {
        return res.json((req as any).user);
    }

    static logout = (req: Request, res: Response) => {
        res.json({ message: 'Sesión cerrada correctamente' });
    }
}