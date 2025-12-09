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
    password!: string;

    // Aquí usamos la clase UserAnimeFav, que se define más abajo.
    // Como es una función flecha () => UserAnimeFav, JS espera a ejecutarla
    // hasta que todo el archivo haya sido leído. ¡Truco maestro!
    @HasMany(() => UserAnimeFavs)
    favorites!: UserAnimeFavs[];
}
@Table({
    tableName: 'user_anime_favs',
    timestamps: true
})
export class UserAnimeFavs extends Model {

    // Clave foránea
    @ForeignKey(() => Users)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    userId!: number;

    // Relación
    @BelongsTo(() => Users)
    user!: Users;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
    })
    animeId!: number;
}