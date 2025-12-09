import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController.js'
import { handleInputErrors } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { FavController } from '../controllers/FavController.js';

// Inciializamos el enrutado
const router = Router();

/*
    ------ RUTAS DE AUTENTICACIÓN ------ 
*/

/* Registro */

// Utilizamos post para todos los formularios, para evitar problemas de seguridad
// La ruta completa sería: /api/auth/create-account, es donde vamos a enviar nuestras peticiones
router.post('/register',

    // Validaciones
    body('username')
        .notEmpty().withMessage("El nombre de usuario no puede ir vacío"),
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