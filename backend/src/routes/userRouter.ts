import { Router } from "express";
import { FavController } from "../controllers/FavController.js";
import { authenticate } from "../middleware/auth.js";

// Inciializamos el enrutado
const router = Router();

/*
    ------ RUTAS DE FAVORITOS ------ 
*/

// Añadir un favorito
router.post('/favorites', authenticate, FavController.addFavorite);

// Obtener todos los favoritos
router.get('/favorites',  authenticate, FavController.getFavorites);

router.get(`/favorite/check/:animeId`, authenticate, FavController.isFavorite)

router.delete('/favorites/:animeId', authenticate, FavController.removeFavorite);

router.get('/favorites/:animeId', authenticate, FavController.getFavoriteById);

export default router;