import express from 'express';
import { db } from './config/db.js';
import authRouter from './routes/authRouter.js';
import morgan from 'morgan';
import cors from 'cors';
import userRouter from './routes/userRouter.js';

export async function connectDB() {

    try {
        await db.authenticate();
        await db.sync({ alter: true });
        console.log("Base de datos conectada.");
    } catch (error) {
        console.error("Error BD:", error);
    }
}

const app = express();

// CORS - Allow all origins since we're using Authorization headers, not cookies
// Updated: 2025-12-14 - Force rebuild
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Endpoint de salud (Health Check) 
app.get('/', (req, res) => {
    res.send('API is running correctly');
});

export default app;