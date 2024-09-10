const db = require('../models/index.db');
const { Users, Preferences } = db;

exports.searchPreference = async (user_id) => {
    try {
        const preference = await Preferences.findOne({ where: { user_id: user_id }, raw: true });
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

exports.checkPreference = (day_preference, time_preference) => {
    try {
        if (typeof day_preference !== 'object' || day_preference === null ||
            typeof time_preference !== 'object' || time_preference === null) {
            return false;        // 요청 데이터 형식 오류
        }

        const day_requiredKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const time_requiredKeys = ['am', 'pm'];
        for (const key of day_requiredKeys) {
            if (!day_preference.hasOwnProperty(key)) {
                return false;        // 요청 데이터 형식 오류
            }
        }
        for (const key of time_requiredKeys) {
            if (!time_preference.hasOwnProperty(key)) {
                return false;        // 요청 데이터 형식 오류
            }
        }

        for (const key in day_preference) {
            const value = day_preference[key];
            if (typeof value !== 'number' || value % 1 !== 0 || value < 1 || value > 5) {
                return false;        // 요청 데이터 형식 오류
            }
        }
        for (const key in time_preference) {
            const value = time_preference[key];
            if (typeof value !== 'number' || value % 1 !== 0 || value < 1 || value > 5) {
                return false;        // 요청 데이터 형식 오류
            }
        }

        return true;

    } catch (err) {
        return false;        // 서버 내부 오류
    }
}

exports.updatePreference = async (user_id, day_preference, time_preference) => {
    try {
        const preference = await Preferences.findOne({ where: { user_id: user_id } });
        if (!preference) {
            return {
                statusCode: 500,    // 사용자가 db에 없음
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