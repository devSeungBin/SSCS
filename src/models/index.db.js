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

const Users = require("./user.model")(sequelize, Sequelize.DataTypes);
const Preferences = require("./preference.model")(sequelize, Sequelize.DataTypes);


const db = {};
db.sequelize = sequelize;
db.Users = Users;
db.Preferences = Preferences;

db.Users.hasMany(db.Preferences);
db.Preferences.belongsTo(db.Users);


Users.sync({ force: false })    // force: true => 기존 테이블을 삭제하고 새로 생성
    .then(() => {
        Preferences.sync({ force: false });
    })
    .then(() => {
        console.log('[DB] 모든 테이블이 생성되었습니다.');
    })
    .catch(err => {
        console.error('테이블 생성 중 오류 발생:', err);
    });


module.exports = db;
