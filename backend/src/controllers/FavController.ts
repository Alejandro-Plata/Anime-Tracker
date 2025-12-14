import { Request, Response } from 'express';
import { UserAnimeFavs } from '../models/AllModels.js';

export class FavController {
    static addFavorite = async (req: Request, res: Response) => {
        try {
            const { animeId, state } = req.body;

            const userId = req.user.id;


            const existingFav = await UserAnimeFavs.findOne({
                where: { userId, animeId }
            });

            if (existingFav) {
                return res.status(400).json({ msg: 'Este anime ya está en favoritos' });
            }

            await UserAnimeFavs.create({
                userId,
                state,
                animeId,
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

            const favorites = await UserAnimeFavs.findAll({
                where: { userId }
            });

            res.json(favorites);
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Hubo un error al obtener los favoritos' });
        }
    };

    static isFavorite = async (req: Request, res: Response) => {
        try {

            const { animeId } = req.params;
            const userId = (req as any).user.id;

            if (!animeId) {
                return res.status(400).json({ message: "Falta el ID del anime" });
            }

            const existingFav = await UserAnimeFavs.findOne({
                where: { userId, animeId }
            });

            if (!existingFav) {
                return res.status(200).json(false);
            }

            return res.status(200).json(true);

        } catch (error) {
            res.status(500).json({ message: "Fallo en el servidor." })
        }
    }
    static removeFavorite = async (req: Request, res: Response) => {
        try {
            const { animeId } = req.params;

            const userId = (req as any).user.id;

            if (!animeId) {
                return res.status(400).json({ msg: "Falta el ID del anime" });
            }

            const deletedCount = await UserAnimeFavs.destroy({
                where: { userId, animeId }
            });

            if (deletedCount === 0) {
                return res.status(404).json({ msg: "No se encontró el favorito para eliminar" });
            }

            res.status(200).json({ msg: "Eliminado de favoritos correctamente" });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al eliminar favorito" });
        }
    }

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

            res.json(favorite);

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al obtener el favorito" });
        }
    };

    static updateFavoriteState = async (req: Request, res: Response) => {
        try {
            const { animeId } = req.params;
            const { state } = req.body;
            const userId = req.user.id;

            if (!animeId) {
                return res.status(400).json({ msg: "Falta el ID del anime" });
            }

            if (!state) {
                return res.status(400).json({ msg: "Falta el estado" });
            }

            const validStates = ['VIENDO', 'FINALIZADO', 'PENDIENTE', 'ABANDONADO'];
            if (!validStates.includes(state)) {
                return res.status(400).json({ msg: "Error al actualizar el estado" });
            }

            const favorite = await UserAnimeFavs.findOne({
                where: { userId, animeId }
            });

            if (!favorite) {
                return res.status(404).json({ msg: "Favorito no encontrado" });
            }

            favorite.state = state;
            await favorite.save();

            res.json({ msg: "Estado actualizado correctamente", favorite });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al actualizar el estado" });
        }
    };

    static updateFavoritePuntuation = async (req: Request, res: Response) => {
        try {
            const { animeId } = req.params;
            const { puntuation } = req.body;
            const userId = req.user.id;

            if (!animeId) {
                return res.status(400).json({ msg: "Falta el ID del anime" });
            }

            if (!puntuation) {
                return res.status(400).json({ msg: "Falta la puntuación" });
            }

            const favorite = await UserAnimeFavs.findOne({
                where: { userId, animeId }
            });

            if (!favorite) {
                return res.status(404).json({ msg: "Favorito no encontrado" });
            }

            favorite.puntuation = puntuation;
            await favorite.save();

            res.json({ msg: "Puntuación actualizada correctamente", favorite });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error al actualizar la puntuación" });
        }
    }
}