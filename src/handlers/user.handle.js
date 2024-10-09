const db = require('../models/index.db');
const { Users, Preferences, Participants, Plans } = db;

function isValidObject(obj) { return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0; };

function filterByTimeRange(busyList, startTime, endTime) {
    const startHours = startTime.split(':')[0];
    const startMinutes = startTime.split(':')[1];

    const endHours = endTime.split(':')[0];
    const endMinutes = endTime.split(':')[1];

    let newBusyList = [];
    for (let busy of busyList) {
        console.log('현재 busy: ', busy)
        const oldDate = new Date(busy.start);
        const year = oldDate.getFullYear();
        const month = oldDate.getMonth();
        const day = oldDate.getDate();

        console.log(new Date(year, month, day, startHours, startMinutes))
        console.log(new Date(year, month, day, endHours, endMinutes))
        const startLimit = new Date(year, month, day, startHours, startMinutes).getTime();
        const endLimit = new Date(year, month, day, endHours, endMinutes).getTime();

        console.log(new Date(busy.start))
        console.log(new Date(busy.end))
        const busyStart = new Date(busy.start).getTime();
        const busyEnd = new Date(busy.end).getTime();

        if (busyStart >= startLimit && busyEnd <= endLimit) {   // 시작 시간과 종료 시간이 모두 지정된 범위 안에 포함되는 경우
            console.log('시작, 종료 모두 안')
            newBusyList.push({
                start: busy.start,
                end: busy.end
            });
        } else if (busyStart < startLimit && busyEnd > endLimit) {   // 시작 시간과 종료 시간이 모두 지정된 범위 안에 포함되지 않는 경우
            console.log('시작, 종료 모두 밖')
            const newBusyStart = new Date(startLimit);
            const newBusyEnd = new Date(endLimit);
            newBusyList.push({
                start: newBusyStart,
                end: newBusyEnd
            });
        }  else if (busyStart < startLimit && (busyEnd > startLimit && busyEnd <= endLimit)) {     // 시작 시간만 지정된 범위에 포함되지 않는 경우
            console.log('시작은 밖, 종료는 안')
            const newBusyStart = new Date(startLimit);
            newBusyList.push({
                start: newBusyStart,
                end: busy.end
            });
        } else if ((busyStart >= startLimit && busyStart < endLimit) && busyEnd > endLimit) {     // 종료 시간만 지정된 범위에 포함되지 않는 경우
            console.log('시작은 안, 종료는 밖')
            const newBusyEnd = new Date(endLimit);
            newBusyList.push({
                start: busy.start,
                end: newBusyEnd
            });
        } else if (busyStart > endLimit) {     // 시작 시간이 지정된 종료 범위보다 큰 경우
            console.log('시작이 거꾸로 밖')
            continue;
        } else if (busyEnd <= startLimit) {     // 종료 시간이 지정된 시작 범위보다 작은 경우
            console.log('종료가 거꾸로 밖')
            continue;
        };
    }

    return newBusyList;
};

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
        if(!changedUser) return {
            statusCode: 404,
            comment: '사용자 프로필을 찾을 수 없습니다.'
        };

        const changedPreference = await Preferences.findOne({ where: { user_id: id }, raw: false });
        if(!changedPreference) return {
            statusCode: 303,
            comment: '신규 사용자입니다. 선호도 입력 페이지로 이동합니다.'
        };
        
        if (user.password) {
            if (changedUser.toJSON().provider !== 'local') {
                return {
                    statusCode: 400,
                    comment: '로컬 로그인으로 인증된 계정만 사용할 수 있습니다.'
                };
            } else {
                if (user.password == changedUser.toJSON().password) {
                    delete user.password;
                };
            };
        };

        if (user.calendar_id) {
            if (changedUser.toJSON().provider !== 'google') {
                return {
                    statusCode: 400,
                    comment: '소셜 로그인으로 인증된 계정만 사용할 수 있습니다.'
                };
            } else {
                if (user.calendar_id == changedUser.toJSON().calendar_id) {
                    delete user.calendar_id;
                };
            };
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

// 혹시 몰라서 console.log는 남겨둠
exports.generateSchedules = async (plan, busy, time_range) => {
    try {
        let submission_time_slot = plan.plan_time_slot;
        let isFree = true;
        let dateIndex = 0;
        let busyIndex = 0;
        console.log('이전 busy: ', busy)

        let newBusy = filterByTimeRange(busy, time_range.start, time_range.end);
        console.log('새로운 busy: ', newBusy);
        for (let date of submission_time_slot) {
            let timeIndex = 0;
            for (let time of date.time_scope) {
                if (newBusy.length !== 0 && busyIndex < newBusy.length) {
                    const startDate = new Date(`${submission_time_slot[dateIndex].date} ${time.start}:00`);
                    const endDate = new Date(`${submission_time_slot[dateIndex].date} ${time.end}:00`);
                    const busyStart = new Date(newBusy[busyIndex].start);
                    const busyEnd = new Date(newBusy[busyIndex].end);

                    if (isFree) {
                        console.log('현재 가능 time: ', time)
                        console.log('현재 가능 busy: ', busyIndex)
                        if (busyStart.getTime() == startDate.getTime() && busyEnd.getTime() == endDate.getTime()) {
                            isFree = false;
                            submission_time_slot[dateIndex].time_scope[timeIndex].available = isFree;
                            isFree = true;
                            busyIndex++;

                        } else if (busyStart.getTime() == startDate.getTime()) {
                            isFree = false;
                            submission_time_slot[dateIndex].time_scope[timeIndex].available = isFree;

                        } else {
                            submission_time_slot[dateIndex].time_scope[timeIndex].available = isFree;
                        }

                    } else {
                        console.log('현재 불가능 time: ', time)
                        console.log('현재 불가능 busy: ', busyIndex)
                        if (busyEnd.getTime() == endDate.getTime()) {
                            submission_time_slot[dateIndex].time_scope[timeIndex].available = isFree;
                            isFree = true;
                            busyIndex++;
                        } else {
                            submission_time_slot[dateIndex].time_scope[timeIndex].available = isFree;
                        };
                    };

                } else {
                    submission_time_slot[dateIndex].time_scope[timeIndex].available = isFree;
                }

                timeIndex++;
            };

            isFree = true;
            dateIndex++;
        };

        return {
            statusCode: 200,
            submission_time_slot: submission_time_slot
        };


    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            comment: err
        };
    };
}
