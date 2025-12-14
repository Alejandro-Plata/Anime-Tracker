import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import { Users } from '../models/AllModels.js'
import { UserAnimeFavs } from '../models/AllModels.js'
declare global {
    namespace Express {
        interface Request {
            user?: Users | null // Puede ser null si no se encuentra
        }
    }
}

interface JwtPayload {
    id: number;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {

    let token = req.cookies.token;

    if (!token) {
        const bearer = req.headers.authorization;

        if (!bearer) {
            const error = new Error('Usuario no autorizado');
            return res.status(401).json({ error: error.message });
        }

        const [, bearerToken] = bearer.split(' ');
        token = bearerToken;
    }

    if (!token) {
        const error = new Error('Token inválido');
        return res.status(401).json({ error: error.message });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

        if (typeof decoded === 'object' && decoded.id) {

            const user = await Users.findByPk(decoded.id, {
                attributes: ['username', 'id'],
                include: [
                    {
                        model: UserAnimeFavs,
                        as: 'favorites',
                        attributes: ['animeId', 'state']
                    }
                ]
            });

            if (!user) {
                return res.status(403).json({ error: 'El usuario no existe' })
            }

            req.user = user;

            next();

        } else {
            return res.status(403).json({ error: 'Token inválido' });
        }

    } catch (error) {
        return res.status(403).json({ error: 'Token inválido' })
    }
}