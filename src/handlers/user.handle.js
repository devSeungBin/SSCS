const db = require('../models/index.db');
const { Users, Preferences, Participants, Plans } = db;

function isValidObject(obj) { return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0; }

exports.searchUser = async (id) => {
    try {
        const user = await Users.findOne({ where: { id: id }, raw: true });
        if(!user) return {
            statusCode: 404,
            comment: '사용자 프로필을 찾을 수 없습니다.'
        };

        const preference = await Preferences.findOne({ where: { user_id: id }, raw: true });
        if(!preference) return {
            statusCode: 303,
            comment: '신규 사용자입니다. 선호도 입력 페이지로 이동합니다.'
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

        return {
            statusCode: 201,
            user: newUser.toJSON()
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.searchPreference = async (id) => {
    try {
        const preference = await Preferences.findOne({ where: { user_id: id }, raw: true });
        if(!preference) return {
            statusCode: 303,
            comment: '신규 사용자입니다. 선호도 입력 페이지로 이동합니다.'
        };

        return {
            statusCode: 200,    // 선호도가 db에 있음
            preference: preference,
        };

    } catch (err) {
        return {
            statusCode: 500,    // db 내부 오류
        };
    };
}

exports.createPreference = async (id, day_preference, time_preference) => {
    try {        
        const newPreference = await Preferences.create({ user_id: id, day_preference: day_preference, time_preference: time_preference });

        return {
            statusCode: 201,    // 선호도가 변경됨
            preference: newPreference.toJSON(),
        };

    } catch (err) {
        return {
            statusCode: 500,    // db 내부 오류
            comment: err
        };
    };
}

exports.checkDay = (day_preference) => {
    try {
        if (!isValidObject(day_preference)) {
            // console.log(day_preference, time_preference)
            // console.log(typeof day_preference, day_preference !== null, Object.keys(day_preference).length)
            // console.log(typeof time_preference, time_preference !== null, Object.keys(time_preference).length)
            return false;        // 요청 데이터 형식 오류
        };

        const day_requiredKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        for (const key of day_requiredKeys) {
            if (!day_preference.hasOwnProperty(key)) {
                return false;        // 요청 데이터 형식 오류
            };
        };

        for (const key in day_preference) {
            const value = day_preference[key];
            if (typeof value !== 'number' || value % 1 !== 0 || value < 1 || value > 5) {
                return false;        // 요청 데이터 형식 오류
            };
        };

        return true;

    } catch (err) {
        return false;        // 서버 내부 오류
    };
}

exports.checkTime = (time_preference) => {
    try {
        if (!isValidObject(time_preference)) {
            // console.log(day_preference, time_preference)
            // console.log(typeof day_preference, day_preference !== null, Object.keys(day_preference).length)
            // console.log(typeof time_preference, time_preference !== null, Object.keys(time_preference).length)
            return false;        // 요청 데이터 형식 오류
        };

        const time_requiredKeys = ['morning', 'afternoon', 'evening'];
        for (const key of time_requiredKeys) {
            if (!time_preference.hasOwnProperty(key)) {
                return false;        // 요청 데이터 형식 오류
            };
        };

        for (const key in time_preference) {
            const value = time_preference[key];
            if (typeof value !== 'number' || value % 1 !== 0 || value < 1 || value > 5) {
                return false;        // 요청 데이터 형식 오류
            };
        };

        return true;

    } catch (err) {
        return false;        // 서버 내부 오류
    };
}

exports.updateUser = async (id, user, preference) => {
    try {
        const changedUser = await Users.findOne({ where: { id: id }, raw: false });
        if(!user) return {
            statusCode: 404,
            comment: '사용자 프로필을 찾을 수 없습니다.'
        };

        const changedPreference = await Preferences.findOne({ where: { user_id: id }, raw: false });
        if(!preference) return {
            statusCode: 303,
            comment: '신규 사용자입니다. 선호도 입력 페이지로 이동합니다.'
        };
        
        if (user) {
            if (user.name == changedUser.toJSON().name) {
                delete user.name;
            };
        };

        if (preference) {
            if (preference.day_preference == changedPreference.toJSON().day_preference) {
                delete preference.day_preference;
            };

            if (preference.time_preference == changedPreference.toJSON().time_preference) {
                delete preference.time_preference;
            };
        };

        await changedUser.update(user);
        await changedUser.save();

        await changedPreference.update(preference);
        await changedPreference.save();

        return {
            statusCode: 200,    // 사용자 정보가 변경됨
            user: changedUser.toJSON(),
            preference: changedPreference.toJSON()
        };

    } catch (err) {
        return {
            statusCode: 500,    // db 내부 오류
            comment: err
        };
    };
}

exports.searchPlan = async (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const myGroup = await Participants.findAll({ where: { user_id: id }, raw: true });
            if (myGroup.length === 0) {
                reject({
                    statusCode: 404,
                    comment: '참여한 그룹이 없습니다.'
                });
            };
    
            let planList = new Array();
            let count = 0;
    
            for(let group of myGroup) {
                const plans = await Plans.findAll({ where: { group_id: group.group_id }, raw: true });
                for (let plan of plans) {
                    planList.push(plan);
                };
                ++count;
            };

            if (planList.length !== 0) {
                resolve({
                    statusCode: 200,
                    plans: planList
                });
            } else {
                reject({
                    statusCode: 404,
                    comment: '참여한 약속이 없습니다.'
                });
            }
    
        } catch (err) {
            reject({
                statusCode: 500,
                comment: err
            });
        };
    });
}
