import jwt from 'jsonwebtoken'

export const generateJWT = (id: string) => {
    const secretKey = process.env.JWT_SECRET // Se lee aquí para asegurarnos de que dotenv ya ha cargado el .env
    const token = jwt.sign({ id }, secretKey, {
        expiresIn: '7d'
    })
    return token
}