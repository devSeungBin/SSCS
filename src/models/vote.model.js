const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Votes extends Model { 
        static associate(models) {
            models.Votes.belongsTo(models.Users, {
                foreignKey: "user_id",
                sourceKey: "id",
            });

            models.Votes.belongsTo(models.Plans, {
                foreignKey: "plan_id",
                targetKey: "id",
            });
        }
    };

    Votes.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        plan_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "sscs_plans",
                key: "id",
                // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
            },
        },
        vote_plan_time: {
            type: DataTypes.ARRAY(DataTypes.JSONB),
            allowNull: false,
        },
    }, {
        sequelize,
        timestamps: true,
        paranoid: false,
        underscored: true,
        modelName: 'Votes',
        tableName: "sscs_votes",
        charset: "utf8mb4",
        // collate: "utf8_general_ci",
    });

    return Votes;
};
