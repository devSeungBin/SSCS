const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Participants extends Model { 
        static associate(models) {
            models.Participants.belongsTo(models.Users, {
                foreignKey: "user_id",
                sourceKey: "id",
            });

            models.Participants.belongsTo(models.Groups, {
                foreignKey: "group_id",
                targetKey: "id",
            });
        }
    };

    Participants.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(255),
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "sscs_users",
                key: "id",
                // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
            },
        },
        group_id: {
            type: DataTypes.INTEGER,
            // allowNull: false,
            references: {
                model: "sscs_groups",
                key: "id",
                // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
            },
        }
    }, {
        sequelize,
        timestamps: true,
        paranoid: false,
        underscored: true,
        modelName: 'Participants',
        tableName: "sscs_participants",
        charset: "utf8mb4",
        // collate: "utf8_general_ci",
    });

    return Participants;
};
