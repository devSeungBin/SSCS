const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Groups extends Model { 
        static associate(models) {
            models.Groups.belongsTo(models.Users, {
                foreignKey: "creator",
                targetKey: "id",
            });

            models.Groups.hasMany(models.Participants, {
                foreignKey: "group_id",
                targetKey: "id",
            });

            models.Groups.hasMany(models.Plans, {
                foreignKey: "group_id",
                targetKey: "id",
            });
        }
    };

    Groups.init({
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
            type: DataTypes.STRING,
        },
        user_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        invitation_code: {
            type: DataTypes.STRING(20),
        },
        // salt: {
        //     type: DataTypes.STRING(255),
        // },
        creator: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "sscs_users",
                key: "id",
                // deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
            },
        }
    }, {
        sequelize,
        timestamps: true,
        paranoid: false,
        underscored: true,
        modelName: 'Groups',
        tableName: "sscs_groups",
        charset: "utf8mb4",
        // collate: "utf8_general_ci",
    });

    return Groups;
};
