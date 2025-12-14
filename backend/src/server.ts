import express from 'express';
import { db } from './config/db.js';
import authRouter from './routes/authRouter.js';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Endpoint de salud (Health Check) 
app.get('/', (req, res) => {
    res.send('API is running correctly');
});

export default app;