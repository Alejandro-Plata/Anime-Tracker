import type { User } from '../models/User.ts'

// URL base de acceso a la base de datos
const API_URL = 'https://valhalla-backend-sv-5wy2.vercel.app/api/auth';

// Temporal
const STORAGE_KEY = "user"

// Servicio encargado de gestionar los inicios de sesión y registros
export const authService = {

    login: async (username: string, password: string): Promise<User> => {

        // Enviamos una petición de tipo POST (evitar problemas de seguridad)
        // aceptando la cookie proveniente del backend.
        // A esta cookie no se puede acceder desde el front (usand document.cookie)
        // +seguridad
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                credentials: 'include', // Para que el navegador acepte la cookie del backend
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: No se pudo iniciar sesión`);
        }

        // Guardamos los datos si no hay errores en la petición
        const data = await response.json();

        const user: User = data.user

        // Guardamos los datos del usuario en el locale storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

        return user;

    },

    register: async (data: { username: string; email: string; password: string }): Promise<User> => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: No se pudo registrar el usuario`);
        }

        console.log("Cuenta creada, iniciando sesión automática...");

        // Si el servidor devuelve un 200, se llama directamente al método login
        // tras el registro

        return await authService.login(data.username, data.password);
    },

    logout: async (): Promise<void> => {
        try {
            console.log("Cerrando sesión...");

            // Llamada al Backend para borrar la cookie HttpOnly
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include' // Enviar la cookie actual para que el servidor sepa qué sesión cerrar
            });

        } catch (error) {
            console.warn("Error al notificar logout al servidor (posiblemente ya expiró)", error);
            // No bloqueamos el logout local aunque falle el servidor
        } finally {
            // Limpieza del usuario desde el locale storage 
            localStorage.removeItem(STORAGE_KEY);
            console.log("Sesión cerrada");
        }
    },

    // Método para obtener los datos del usuario loggeado 
    getCurrentUser: (): User | null => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.log(e)
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
    }
};