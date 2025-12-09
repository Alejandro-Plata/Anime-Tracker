import { Sequelize } from 'sequelize-typescript' // Configuración de nuestra base de datos
import dotenv from 'dotenv'; // Variables de entorno
import { Users, UserAnimeFavs } from '../models/AllModels.js'
import pg from 'pg'
dotenv.config(); // Configura las operaciones con las variables de entorno

// La instancia de Sequelize recibe primero la conexión y después un objeto de configuración
export const db = new Sequelize(process.env.DATABASE_URL, {
    // Definimos dónde debe buscar los modelos (tablas) en nuestro proyecto
    models: [Users, UserAnimeFavs], // Busca el modelo de User y UserAnimeFav
    logging: false, // Sirve para que cada vez que actualicemos la BD, no nos muestre todos los comandos en la terminal
    dialectOptions: {
        ssl: {
            require: false
        }
    },
    dialectModule: pg
})