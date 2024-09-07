const db = require('../models/index.db');
const { User } = db;

exports.searchUser = async (email, provider) => {
    try {
        const user = await User.findOne({ where: { email: email, provider: provider }, raw: true });
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
        if (await User.findOne({ where: { email: user.email } })) {
            return {
                statusCode: 500,    // 이미 사용자가 db에 있음
            };
        }
        
        await User.create(user);
        return {
            statusCode: 201,    // db에 사용자 추가
            info: user,
        };

    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,    // db 내부 오류
        };
    }
}
