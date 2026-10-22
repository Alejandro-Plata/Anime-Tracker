import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Users, UserAnimeFavs } from '../models/AllModels.js';
import { checkPassword, hashPassword } from '../utils/auth.js';

// Datos que se devuelven al frontend: nunca la contraseña ni los códigos de recuperación
const publicProfile = (user: Users) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
});

export class ProfileController {

    // El middleware solo carga username e id, así que aquí se pide el usuario completo
    private static loadUser = (req: Request) => Users.findByPk(req.user!.id);

    static getProfile = async (req: Request, res: Response) => {
        try {
            const user = await ProfileController.loadUser(req);
            if (!user) return res.status(404).json({ error: 'El usuario no existe' });
            return res.json(publicProfile(user));
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'No se pudo cargar el perfil' });
        }
    }

    static updateProfile = async (req: Request, res: Response) => {
        try {
            const user = await ProfileController.loadUser(req);
            if (!user) return res.status(404).json({ error: 'El usuario no existe' });

            const username: string = req.body.username.trim();
            const email: string = req.body.email.trim();

            // No se puede coger el nombre o el correo de otra cuenta
            const taken = await Users.findOne({
                where: { id: { [Op.ne]: user.id }, [Op.or]: [{ username }, { email }] },
            });
            if (taken) {
                const field = taken.username === username ? 'nombre de usuario' : 'correo';
                return res.status(409).json({ error: `Ese ${field} ya está en uso` });
            }

            user.username = username;
            user.email = email;
            await user.save();
            return res.json(publicProfile(user));
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'No se pudo actualizar el perfil' });
        }
    }

    static changePassword = async (req: Request, res: Response) => {
        try {
            const user = await ProfileController.loadUser(req);
            if (!user) return res.status(404).json({ error: 'El usuario no existe' });

            const { currentPassword, newPassword } = req.body;
            if (!(await checkPassword(currentPassword, user.password))) {
                return res.status(401).json({ error: 'La contraseña actual no es correcta' });
            }

            user.password = await hashPassword(newPassword);
            await user.save();
            return res.json({ message: 'Contraseña actualizada' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'No se pudo cambiar la contraseña' });
        }
    }

    // Borrar la cuenta pide la contraseña para evitar borrados por error o desde una sesión ajena
    static deleteAccount = async (req: Request, res: Response) => {
        try {
            const user = await ProfileController.loadUser(req);
            if (!user) return res.status(404).json({ error: 'El usuario no existe' });

            if (!(await checkPassword(req.body.password, user.password))) {
                return res.status(401).json({ error: 'La contraseña no es correcta' });
            }

            await UserAnimeFavs.destroy({ where: { userId: user.id } });
            await user.destroy();
            return res.json({ message: 'Cuenta eliminada' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'No se pudo eliminar la cuenta' });
        }
    }
}
