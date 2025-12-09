import { Request, Response } from 'express';
import { UserAnimeFavs } from '../models/AllModels.js';

export class FavController {
    static addFavorite = async (req: Request, res: Response) => {
        try {
            // Primero se recibe el id del cuerpo de la petición
            const { animeId } = req.body;

            // Obtenemos el userId del usuario con la sesión iniciada
            const userId = req.user.id;

            // Verificamos si ya existe para no duplicarlo
            const existingFav = await UserAnimeFavs.findOne({
                where: { userId, animeId }
            });

            if (existingFav) {
                return res.status(400).json({ msg: 'Este anime ya está en favoritos' });
            }

            // Creamos el registro en la BD
            await UserAnimeFavs.create({
                userId,
                animeId
            });

            res.status(201).json({ msg: 'Anime añadido a favoritos' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Hubo un error al guardar el favorito' });
        }
    };

    static getFavorites = async (req: Request, res: Response) => {
        try {
            // Obtenemos el userId del usuario con la sesión iniciada
            const userId = req.user.id;

            // Buscamos todos los favoritos del usuario
            const favorites = await UserAnimeFavs.findAll({
                where: { userId }
            });

            // Devolvemos la lista de favoritos
            res.json(favorites);
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Hubo un error al obtener los favoritos' });
        }
    };

    static isFavorite = async (req: Request, res: Response) => {
        try {

            // Recibimos el id del anime por los parámetros de la url
            const { animeId } = req.params; 

            // Obtenemos el id del usuario 
            const userId = (req as any).user.id;

            // Si no hay id, detenemos la ejecución
            if (!animeId) {
                return res.status(400).json({ message: "Falta el ID del anime" });
            }

            // Si no es null, el anime se encuentra añadido a favoritos
            const existingFav = await UserAnimeFavs.findOne({
                where: { userId, animeId }
            });

            if (!existingFav) {
                return res.status(200).json(false); // No es favorito
            }

            return res.status(200).json(true); // Sí es favorito

        } catch(error) {
            res.status(500).json({message: "Fallo en el servidor."})
        }
    }
    static removeFavorite = async (req: Request, res: Response) => {
        try {
            // 1. Obtenemos el ID de la URL
            const { animeId } = req.params;
            
            // 2. Obtenemos el ID del usuario del token
            const userId = (req as any).user.id;

            if (!animeId) {
                return res.status(400).json({ msg: "Falta el ID del anime" });
            }

            // 3. Borramos el registro que coincida con AMBOS ids
            const deletedCount = await UserAnimeFavs.destroy({
                where: { userId, animeId }
            });

            if (deletedCount === 0) {
                // Si devuelve 0, es que no existía ese favorito
                return res.status(404).json({ msg: "No se encontró el favorito para eliminar" });
            }

            // 4. Éxito
            res.status(200).json({ msg: "Eliminado de favoritos correctamente" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al eliminar favorito" });
        }
    }

    // Obtener un favorito específico por ID
    static getFavoriteById = async (req: Request, res: Response) => {
        try {
            const { animeId } = req.params;
            const userId = (req as any).user.id;

            if (!animeId) {
                return res.status(400).json({ msg: "Falta el ID del anime" });
            }

            const favorite = await UserAnimeFavs.findOne({
                where: { userId, animeId }
            });

            if (!favorite) {
                return res.status(404).json({ msg: "Favorito no encontrado" });
            }

            // Devolvemos el objeto completo del favorito
            res.json(favorite);

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al obtener el favorito" });
        }
    };
}