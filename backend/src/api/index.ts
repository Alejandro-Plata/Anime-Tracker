import app, { connectDB } from '../server.js';

const PORT = process.env.PORT || 3000;

// Lógica de arranque
const startServer = async () => {
    // Conectamos a la BD
    await connectDB();

    if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en local en puerto ${PORT}`);
        });
    }
}

// Ejecutamos la función
startServer();

// Hay que exportar la app para que sea Vercel el que maneje las peticiones
export default app;