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
        console.log('[Server] 데이터베이스가 성공적으로 연결되었습니다.');
    } catch (error) {
        console.error('[Server] 데이터베이스 연결에 실패했습니다: ', error);
    }
})();

const Users = require("./user.model")(sequelize, Sequelize.DataTypes);
const Preferences = require("./preference.model")(sequelize, Sequelize.DataTypes);
const Groups = require("./group.model")(sequelize, Sequelize.DataTypes);
const GroupUsers = require("./group.user.model")(sequelize, Sequelize.DataTypes);


const db = {};
db.sequelize = sequelize;
db.Users = Users;
db.Preferences = Preferences;
db.Groups = Groups;
db.GroupUsers = GroupUsers;

// db.Users.hasOne(db.Preferences);
// db.Users.hasMany(db.Groups);
// db.Users.hasMany(db.GroupUsers);

// db.Groups.belongsTo(db.Users);
// db.Groups.hasMany(db.GroupUsers);

// db.GroupUsers.belongsTo(db.Users);
// db.GroupUsers.belongsTo(db.Groups);

// db.Preferences.belongsTo(db.Users);


const test = true;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

Users.sync({ force: test })    // force: true => 기존 테이블을 삭제하고 새로 생성
    .then(() => {
        delay(0).then(() => {
            Preferences.sync({ force: test });
        });
    })
    .then(() => {
        delay(0).then(() => {
            Groups.sync({ force: test });
        });
    })
    .then(() => {
        delay(3000).then(() => {
            GroupUsers.sync({ force: test });
            console.log('[Server] 모든 테이블이 생성되었습니다.');
        });
    })
    .catch(err => {
        console.error('[Server] 테이블 생성 중 오류 발생:', err);
    });


module.exports = db;
