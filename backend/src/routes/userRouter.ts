import { Router } from "express";
import { FavController } from "../controllers/FavController.js";
import { authenticate } from "../middleware/auth.js";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation.js";
import { ProfileController } from "../controllers/ProfileController.js";

const router = Router();

router.post('/favorites', authenticate, FavController.addFavorite);

router.get('/favorites', authenticate, FavController.getFavorites);

router.get(`/favorite/check/:animeId`, authenticate, FavController.isFavorite)

router.patch('/favorites/:animeId/state', authenticate, FavController.updateFavoriteState);

router.patch('/favorites/:animeId/score', authenticate, FavController.updateFavoriteScore);

router.delete('/favorites/:animeId', authenticate, FavController.removeFavorite);

router.get('/favorites/:animeId', authenticate, FavController.getFavoriteById);

/* Perfil del usuario */

router.get('/profile', authenticate, ProfileController.getProfile);

router.patch('/profile',
    authenticate,
    body('username')
        .trim()
        .isLength({ min: 3, max: 150 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
    body('email')
        .trim()
        .notEmpty().withMessage('El email no puede ir vacío')
        .isEmail().withMessage('El email no es válido'),
    handleInputErrors,
    ProfileController.updateProfile
);

router.put('/password',
    authenticate,
    body('currentPassword').notEmpty().withMessage('Escribe tu contraseña actual'),
    body('newPassword')
        .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
        .custom((value, { req }) => value !== req.body.currentPassword)
        .withMessage('La nueva contraseña debe ser distinta de la actual'),
    handleInputErrors,
    ProfileController.changePassword
);

router.delete('/profile',
    authenticate,
    body('password').notEmpty().withMessage('Escribe tu contraseña para confirmar'),
    handleInputErrors,
    ProfileController.deleteAccount
);

export default router;