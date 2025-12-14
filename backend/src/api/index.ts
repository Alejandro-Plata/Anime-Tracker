import app, { connectDB } from '../server.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();

    if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en local en puerto ${PORT}`);
        });
    }
}

startServer();

// Hay que exportar la app para que sea Vercel el que maneje las peticiones
export default app;