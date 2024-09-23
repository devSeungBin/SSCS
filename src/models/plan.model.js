const { Model, Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Plans extends Model { 
        static associate(models) {
            models.Plans.belongsTo(models.Groups, {
                foreignKey: "group_id",
                targetKey: "id",
            });

            models.Plans.hasMany(models.Submissions, {
                foreignKey: "plan_id",
                targetKey: "id",
            });

        }
    };

    Plans.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        group_id: {
            type: DataTypes.INTEGER,
            // allowNull: false,
            references: {
                model: "sscs_groups",
                key: "id",
                // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
            },
        },
        plan_time: {
            type: DataTypes.RANGE(DataTypes.DATE),
        },
        plan_time_slot: {
            type: DataTypes.ARRAY(DataTypes.JSON),
            allowNull: false,
        },
        minimum_user_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        progress_time: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        deadline: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    }, {
        sequelize,
        timestamps: true,
        paranoid: false,
        underscored: true,
        modelName: 'Plans',
        tableName: "sscs_plans",
        charset: "utf8mb4",
        // collate: "utf8_general_ci",
    });

    return Plans;
};
