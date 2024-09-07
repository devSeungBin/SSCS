const keys = require('../config/keys.config');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(keys.DB_NAME, keys.DB_USER, keys.DB_PASSWORD, {
    host: keys.DB_HOST,
    port: keys.DB_PORT,
    dialect: 'postgres',
    logging: false,  
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('[DB] 데이터베이스가 성공적으로 연결되었습니다.');
    } catch (error) {
        console.error('[DB] 데이터베이스 연결에 실패했습니다: ', error);
    }
})();


const User = require("./user.model")(sequelize, Sequelize.DataTypes);



const db = {};
db.User = User;


module.exports = db;
