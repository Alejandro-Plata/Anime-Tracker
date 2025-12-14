import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController.js'
import { handleInputErrors } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();


/* Registro */

// Utilizamos post para todos los formularios, para evitar problemas de seguridad
router.post('/register',

    // Validaciones
    body('username')
        .notEmpty().withMessage("El nombre de usuario no puede ir vacío"),
    body('email')
        .notEmpty().withMessage("El email no puede ir vacío")
        .isEmail().withMessage("El email no es válido"),
    body('password').isLength({ min: 6 }).withMessage("La contraseña es demasiado corta"),
    handleInputErrors,
    AuthController.createAccount);

/* Login */

router.post('/login',
    body('username')
        .notEmpty().withMessage("El nombre de usuario es obligatorio."),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria.'),
    handleInputErrors,
    AuthController.login
);

/* Traer la información del usuario para el frontend, validando el jwt */

router.get('/user',
    authenticate,
    AuthController.user
)

router.post('/logout', AuthController.logout);




export default router;