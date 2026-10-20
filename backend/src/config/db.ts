import { Sequelize } from 'sequelize-typescript' // Configuración de nuestra base de datos
import dotenv from 'dotenv'; // Variables de entorno
import { Users, UserAnimeFavs } from '../models/AllModels.js'
import pg from 'pg'
dotenv.config(); // Configura las operaciones con las variables de entorno

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
    throw new Error(
        'Falta la variable de entorno DATABASE_URL. Configúrala en el entorno o en backend/.env.'
    );
}

// Bases de datos en la nube (Neon, Supabase...) exigen SSL: se activa si la URL trae ?sslmode=require.
// Una base en localhost (Docker) no lo soporta, así que ahí se desactiva. Con cualquier otra URL
// se mantiene la configuración que ya funcionaba en producción.
const usaSsl = /sslmode=require/.test(databaseUrl);
const esLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(databaseUrl);

// La instancia de Sequelize recibe primero la conexión y después un objeto de configuración
export const db = new Sequelize(databaseUrl, {
    // Definimos dónde debe buscar los modelos (tablas) en nuestro proyecto
    models: [Users, UserAnimeFavs], // Busca el modelo de User y UserAnimeFav
    logging: false, // Sirve para que cada vez que actualicemos la BD, no nos muestre todos los comandos en la terminal
    dialectOptions: {
        // rejectUnauthorized:false acepta el certificado del proveedor sin necesitar su CA
        ssl: usaSsl ? { require: true, rejectUnauthorized: false } : esLocal ? false : { require: false }
    },
    dialectModule: pg
})