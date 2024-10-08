const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Users extends Model { 
        static associate(models) {
            models.Users.hasOne(models.Preferences, {
                foreignKey: "user_id",
                sourceKey: "id",
            });

            models.Users.hasMany(models.Groups, {
                foreignKey: "creator",
                sourceKey: "id",
            });

            models.Users.hasMany(models.Participants, {
                foreignKey: "user_id",
                sourceKey: "id",
            });

            models.Users.hasMany(models.Submissions, {
                foreignKey: "user_id",
                sourceKey: "id",
            });

            models.Users.hasMany(models.Votes, {
                foreignKey: "user_id",
                sourceKey: "id",
            });
        }
    };

    Users.init({
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
            type: DataTypes.STRING(255),
        },
        provider: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        access_token: {
            type: DataTypes.STRING(300),
        },
        calendar_id: {
            type: DataTypes.STRING(100),
        },
    }, {
        sequelize,
        timestamps: true,
        paranoid: false,
        underscored: true,
        modelName: 'Users',
        tableName: "sscs_users",
        charset: "utf8mb4",
        // collate: "utf8_general_ci",
    });

    return Users;
};
