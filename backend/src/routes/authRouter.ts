import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController.js'
import { handleInputErrors } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Limita las peticiones de recuperación por IP: evita que alguien use la web para llenar de correos
// el buzón de otra persona o para probar códigos sin parar
const recoveryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' }
});


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

/* Recuperar contraseña con un código enviado por correo */

router.post('/forgot-password',
    recoveryLimiter,
    body('email')
        .notEmpty().withMessage("El email no puede ir vacío")
        .isEmail().withMessage("El email no es válido"),
    handleInputErrors,
    AuthController.forgotPassword
);

router.post('/reset-password',
    recoveryLimiter,
    body('email').isEmail().withMessage("El email no es válido"),
    body('code').isLength({ min: 6, max: 6 }).withMessage("El código tiene 6 dígitos"),
    body('password').isLength({ min: 6 }).withMessage("La contraseña es demasiado corta"),
    handleInputErrors,
    AuthController.resetPassword
);

router.post('/logout', AuthController.logout);




export default router;