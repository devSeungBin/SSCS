const db = require('../models/index.db');
const { Users, Preferences } = db;

exports.searchUser = async (email, provider) => {
    try {
        const user = await Users.findOne({ where: { email: email, provider: provider }, raw: true });  // promise 반환값을 json으로 보고 싶으면 raw: true
        if(!user) {
            return {
                statusCode: 400,    // 사용자가 db에 없음
            };
        }

        return {
            statusCode: 200,    // 사용자가 db에 있음
            info: user,
        };

    } catch (err) {
        return {
            statusCode: 500,    // db 내부 오류
        };
    }
}

exports.createUser = async (user) => {
    if (!user.name || !user.email || !user.password) {
        return {
            statusCode: 400,    // 잘못된 사용자 정보 입력
        };
    }

    try {
        if (await Users.findOne({ where: { email: user.email } })) {
            return {
                statusCode: 400,    // 이미 사용자가 db에 있음
            };
        }
        
        const newUser = await Users.create(user);
        await Preferences.create({ user_id: newUser.id });

        return {
            statusCode: 201,    // db에 사용자 추가
            info: newUser,
        };

    } catch (err) {
        return {
            statusCode: 500,    // db 내부 오류
        };
    }
}
