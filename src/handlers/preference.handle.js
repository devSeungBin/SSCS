const db = require('../models/index.db');
const { Users, Preferences } = db;

exports.searchPreference = async (id) => {
    try {
        const preference = await Preferences.findOne({ where: { UserId: id }, raw: true });
        if(!preference) {
            return {
                statusCode: 400,    // 선호도가 db에 없음
            };
        }

        return {
            statusCode: 200,    // 선호도가 db에 있음
            info: preference,
        };

    } catch (err) {
        return {
            statusCode: 500,    // db 내부 오류
        };
    }
}

exports.updatePreference = async (user, day_preference, time_preference) => {
    try {
        const preference = await Preferences.findOne({ where: { UserId: user.id }, raw: true });
        
        if(!preference) {
            return {
                statusCode: 400,    // 선호도가 db에 없음
            };
        }

        if((day_preference.length() != 7) || (time_preference.length() != 2)) {
            return {
                statusCode: 400,    // 선호도 양식이 잘못됐음
            };
        }

        if(day_preference.some((e) => { !(e.isInteger()) || (e < 1) || (e > 5) }) ||
           time_preference.some((e) => { !(e.isInteger()) || (e < 1) || (e > 5) })) {
            return {
                statusCode: 400,    // 선호도 양식이 잘못됐음
            };
        }

        if(preference.day_preference === day_preference && preference.time_preference === time_preference) {
            return {
                statusCode: 400,    // 변경하려는 선호도가 없음
            };
        }

        await preference.update({ day_preference: day_preference, time_preference: time_preference });
        await preference.save();

        return {
            statusCode: 201,    // 선호도가 변경됨
            info: preference,
        };

    } catch (err) {
        return {
            statusCode: 500,    // db 내부 오류
        };
    }
}