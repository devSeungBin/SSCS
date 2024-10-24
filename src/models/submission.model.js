const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Submissions extends Model { 
        static associate(models) {
            models.Submissions.belongsTo(models.Users, {
                foreignKey: "user_id",
                sourceKey: "id",
            });

            models.Submissions.belongsTo(models.Plans, {
                foreignKey: "plan_id",
                targetKey: "id",
            });
        }
    };

    Submissions.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
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
        submission_time_slot: {
            type: DataTypes.ARRAY(DataTypes.JSONB),
            allowNull: false,
        },
    }, {
        sequelize,
        timestamps: true,
        paranoid: false,
        underscored: true,
        modelName: 'Submissions',
        tableName: "sscs_submissions",
        charset: "utf8mb4",
        // collate: "utf8_general_ci",
    });

    return Submissions;
};
