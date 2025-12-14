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
    puntuation!: number;

    @BelongsTo(() => Users)
    user!: Users;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
    })
    animeId!: number;
}