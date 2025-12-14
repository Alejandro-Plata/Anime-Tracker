import { Router } from "express";
import { FavController } from "../controllers/FavController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post('/favorites', authenticate, FavController.addFavorite);

router.get('/favorites', authenticate, FavController.getFavorites);

router.get(`/favorite/check/:animeId`, authenticate, FavController.isFavorite)

router.patch('/favorites/:animeId/state', authenticate, FavController.updateFavoriteState);

router.patch('/favorites/:animeId/score', authenticate, FavController.updateFavoriteScore);

router.delete('/favorites/:animeId', authenticate, FavController.removeFavorite);

router.get('/favorites/:animeId', authenticate, FavController.getFavoriteById);

export default router;