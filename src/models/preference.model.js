const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Preferences extends Model { 
        static associate(models) {
            models.Preferences.belongsTo(models.Users, {
                foreignKey: "user_id",
                targetKey: "id",
            });
        }
    };

    Preferences.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: "sscs_users",
                key: "id",
                // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
            },
        },
        day_preference: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        time_preference: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
    }, {
        sequelize,
        timestamps: true,
        paranoid: false,
        underscored: true,
        modelName: 'Preferences',
        tableName: "sscs_preferences",
        // charset: "utf8",
        // collate: "utf8_general_ci",
    });

    return Preferences;
};
