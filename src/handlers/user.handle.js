const db = require('../models/index.db');
const { Users, Preferences } = db;

exports.searchUser = async (id) => {
    try {
        const user = await Users.findOne({ where: { id: id }, raw: true });
        if(!user) return {
            statusCode: 404,
            comment: '사용자 프로필을 찾을 수 없습니다.'
        };

        const preference = await Users.findOne({ where: { user_id: user.id }, raw: true });
        if(!preference) return {
            statusCode: 404,
            comment: '사용자 선호도를 찾을 수 없습니다.'
        };

        return {
            statusCode: 200,
            user: user,
            preference: preference
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.createUser = async (user) => {
    if (!user.name || !user.email || !user.password) {
        return {
            statusCode: 400,
            comment: '회원가입에 필요한 정보가 올바르지 않습니다.'
        };
    }

    try {
        if (await Users.findOne({ where: { email: user.email } })) {
            return {
                statusCode: 409,
                comment: '이미 해당 이메일을 사용하는 사용자가 있습니다.'
            };
        }

        user = {
            name: user.name,
            email: user.email,
            password: user.password,
            provider: 'local',
            new: true
        };
        
        const newUser = await Users.create(user);
        const newPreference = await Preferences.create({ user_id: newUser.id });

        return {
            statusCode: 201,
            user: newUser.toJSON(),
            preference: newPreference.toJSON()
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}
