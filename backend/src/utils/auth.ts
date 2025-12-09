import bcrypt from 'bcrypt'

// Función encargada de generar el password (es necesario hashear los passwords para evitar que los roben)
export const hashPassword = async ( password: string ) => {

    const salt = await bcrypt.genSalt(10) // Cantidad de vueltas que se dan para hashear el password, sería 
                                          // el equivalente a barajar 10 veces. A más veces, más seguro pero más lento
    return await bcrypt.hash(password, salt);
}

export const checkPassword = async ( password: string, hash: string ) => {
    return await bcrypt.compare(password, hash)
}