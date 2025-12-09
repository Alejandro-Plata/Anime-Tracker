import jwt from 'jsonwebtoken'

const secretKey = process.env.JWT_SECRET

export const generateJWT = (id: string) => {
    const token = jwt.sign({ id }, secretKey, {
        expiresIn: '7d'
    })
    return token
}