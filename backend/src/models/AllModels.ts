import { Table, Column, Model, DataType, HasMany, BelongsTo, ForeignKey, AllowNull, Unique } from 'sequelize-typescript';

@Table({
    tableName: 'users',
    timestamps: true
})
export class Users extends Model {

    @AllowNull(false)
    @Unique(true)
    @Column({
        type: DataType.STRING(150)
    })
    username!: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(150)
    })
    email!: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(150)
    })
    password!: string;

    // Recuperación de contraseña: guardamos el HASH del código (nunca el código en claro),
    // igual que hacemos con las contraseñas, y cuándo caduca.
    @Column({
        type: DataType.STRING(100)
    })
    resetCode!: string | null;

    @Column({
        type: DataType.DATE
    })
    resetCodeExpires!: Date | null;

    // Intentos fallidos con el código actual: con 6 dígitos habría 1 millón de combinaciones,
    // así que cortamos tras unos pocos fallos para que no se pueda probar por fuerza bruta
    @Column({
        type: DataType.INTEGER,
        defaultValue: 0
    })
    resetAttempts!: number;

    @HasMany(() => UserAnimeFavs)
    favorites!: UserAnimeFavs[];
}
@Table({
    tableName: 'user_anime_favs',
    timestamps: true
})
export class UserAnimeFavs extends Model {

    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    userId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.ENUM('VIENDO', 'FINALIZADO', 'PENDIENTE', 'ABANDONADO'),
        defaultValue: 'VIENDO'
    })
    state!: string;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0
    })
    score!: number;

    @BelongsTo(() => Users)
    user!: Users;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
    })
    animeId!: number;
}