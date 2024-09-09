const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model { }

    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(100),
        },
        image: {
            type: DataTypes.STRING,
        },
        provider: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW(),
        },
    }, {
        timestamps: false,
        sequelize,
        modelName: 'sscs_users',
    });

    (async () => { 
        try {
            await sequelize.sync();
            console.log("[DB] User 테이블이 연결되었습니다.");
        } catch(error) {
            console.log(`[DB] User 테이블 생성 또는 연결에 실패했습니다: ${error}`);
        }
    })();

    return User;
};