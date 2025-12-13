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

    const bearer = req.headers.authorization

    // Verificamos que el token exista
    if (!bearer) {
        const error = new Error('Usuario no autorizado')
        return res.status(401).json({ error: error.message })
    }

    // Obtenemos el token
    const [, token] = bearer.split(' ')

    // Verificamos que el token sea válido (bearer)
    if (!token) {
        const error = new Error('Token inválido')
        return res.status(401).json({ error: error.message })
    }

    try {
        // Depuración para no olvidar las variable de entorno
        if (!process.env.JWT_SECRET) {
            throw new Error('Falta JWT_SECRET en variables de entorno');
        }

        // Decodificamos el token
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
        console.log(error); // Útil para depurar
        return res.status(403).json({ error: 'Token inválido' })
    }
}