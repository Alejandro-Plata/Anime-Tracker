import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { Users } from '../models/AllModels.js';
import { UserAnimeFavs } from '../models/AllModels.js';

declare global {
    namespace Express {
        interface Request {
            user?: Users | null
        }
    }
}

interface JwtPayload {
    id: number;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {

    // Obtenemos el header Authorization
    const bearer = req.headers.authorization;
    if (!bearer) {
        const error = new Error('Usuario no autorizado');
        return res.status(401).json({ error: error.message });
    }

    // Separamos "Bearer" del token real
    const [, token] = bearer.split(' ');

    if (!token) {
        const error = new Error('Token no proporcionado');
        return res.status(401).json({ error: error.message });
    }

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('Falta JWT_SECRET en variables de entorno');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

        if (typeof decoded === 'object' && decoded.id) {

            const user = await Users.findByPk(decoded.id, {
                attributes: ['username', 'id'],
                include: [
                    {
                        model: UserAnimeFavs,
                        as: 'favorites',
                        attributes: ['animeId', 'state', 'score']
                    }
                ]
            });

            if (!user) {
                return res.status(403).json({ error: 'El usuario no existe' });
            }

            req.user = user;
            next();

        } else {
            return res.status(403).json({ error: 'Token inválido' });
        }

    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
}