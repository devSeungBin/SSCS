const { Model } = require('sequelize');

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
            field: "UserId",
            type: DataTypes.INTEGER,
        },
        day_preference: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: [3, 3, 3, 3, 3, 3, 3],
        },
        time_preference: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: [3, 3],
        },
    }, {
        sequelize,
        timestamps: true,
        paranoid: false,
        // underscored: false,
        modelName: 'Preferences',
        tableName: "sscs_users_preferences",
        // charset: "utf8",
        // collate: "utf8_general_ci",
    });

    return Preferences;
};


// const Sequelize = require('sequelize');

// module.exports = class Preferences extends Sequelize.Model { 
//     static init(sequelize) {
//         return super.init({
//             id: {
//                 type: Sequelize.INTEGER,
//                 autoIncrement: true,
//                 primaryKey: true,
//             },
//             day_preference: {
//                 type: Sequelize.ARRAY(Sequelize.STRING),
//                 allowNull: false,
//                 defaultValue: [3, 3, 3, 3, 3, 3, 3],
//             },
//             time_preference: {
//                 type: Sequelize.ARRAY(Sequelize.STRING),
//                 allowNull: false,
//                 defaultValue: [3, 3],
//             },
//         }, {
//             sequelize,
//             timestamps: true,
//             paranoid: true,
//             underscored: false,
//             modelName: 'Preferences',
//             tableName: "sscs_users_preferences",
//             charset: "utf8",
//             collate: "utf8_general_ci",
//         });
//     }

//     static associate(models) {
//         models.Preferences.belongsTo(models.Users, {
//             foreignKey: "user_id",
//             targetKey: "id",
//         });
//     }
// };
