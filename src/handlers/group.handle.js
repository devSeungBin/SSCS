const crypto = require('crypto');
const db = require('../models/index.db');
const { Groups, Participants, Plans, Submissions, Preferences } = db;

exports.searchGroup = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const myGroup = await Participants.findAll({ where: { user_id: id }, raw: true });
            if (myGroup.length === 0) {
                reject({
                    statusCode: 404,
                    comment: '참여한 그룹이 없습니다.'
                });
            };
    
            let groupList = new Array();
            let count = 0;
    
            myGroup.forEach(async (group) => {
                groupList.push(await Groups.findOne({ where: { id: group.group_id }, raw: true }));
                ++count;
                
                if (count === myGroup.length) {
                    resolve({
                        statusCode: 200,
                        groupList: groupList
                    });
                };
            });
    
        } catch (err) {
            reject({
                statusCode: 500,
                comment: err
            });
        };
    });
}

exports.searchParticipant = async (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const participants = await Participants.findAll({ where: { group_id: id }, raw: true });
            if (participants.length === 0) {
                reject({
                    statusCode: 404,
                    comment: '그룹에 참여한 인원이 없습니다.'
                });
            };
    
            resolve({
                statusCode: 200,
                participants: participants
            });
    
        } catch (err) {
            reject({
                statusCode: 500,
                comment: err
            });
        };
    });
}

exports.createGroup = async (group) => {
    if (!group.name || !group.creator) {
        return {
            statusCode: 400,
            comment: '그룹 생성에 필요한 정보가 올바르지 않습니다.'
        };
    };

    try {        
        const newGroup = await Groups.create(group);
        await Participants.create({ user_id: group.creator, group_id: newGroup.id });

        return {
            statusCode: 201,
            group: newGroup.toJSON()
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.searchGroupInfo = async (id) => {
    try {
        const group = await Groups.findOne({ where: { id: id }, raw: true });
        if (!group) {
            return {
                statusCode: 404,
                comment: '그룹이 존재하지 않습니다.'
            };

        } else {
            return {
                statusCode: 200,
                group: group
            };
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.createInvitationCode = async (id) => {
    try {
        const group = await Groups.findOne({ where: { id: id }, raw: true });
        if (!group) {
            return {
                statusCode: 404,
                comment: '그룹이 존재하지 않습니다.'
            };

        } else {
            const today = new Date();
            const buf = crypto.randomBytes(64);
            const key = crypto.pbkdf2Sync(
                `${group.name}${group.id}${group.user_count}${today.toLocaleDateString('en-US')}`,
                buf.toString('base64'), 9999, 9, 'sha512');

            return {
                statusCode: 200,
                invitation_code: key.toString('base64')
            };
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.updateGroup = async (group) => {
    try {
        const changedGroup = await Groups.findOne({ where: { id: group.id }, raw: false });
        if (!changedGroup) {
            return {
                statusCode: 404,
                comment: '그룹이 존재하지 않습니다.'
            };

        } else {
            if (group.name == changedGroup.toJSON().name) {
                delete group.name;
            };

            if (group.invitation_code == changedGroup.toJSON().invitation_code) {
                delete group.invitation_code;
            };

            if (group.preference_setting == changedGroup.toJSON().preference_setting) {
                delete group.preference_setting;
            };

            if (group.manual_group_preference == changedGroup.toJSON().manual_group_preference) {
                delete group.manual_group_preference;
            };

            await changedGroup.update(group);
            await changedGroup.save();

            return {
                statusCode: 200,
                group: changedGroup.toJSON()
            };
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.joinGroup = async (id, invitation_code) => {
    try {
        const group = await Groups.findOne({ where: { invitation_code: invitation_code }, raw: false });
        if(!group) {
            return {
                statusCode: 404,
                comment: '초대코드에 해당하는 그룹이 존재하지 않습니다.'
            };
        };

        const isParticipant = await Participants.findOne({ where: { user_id: id, group_id: group.dataValues.id }, raw: false });
        if(isParticipant) {
            return {
                statusCode: 409,
                comment: '이미 해당 그룹에 참여자입니다.'
            };
        };

        const participant = await Participants.create({ user_id: id, group_id: group.dataValues.id });
        await group.update({ user_count: ++group.user_count });
        await group.save();
        
        return {
            statusCode: 201,
            participant: participant.toJSON(),
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.createPreferences = async (user_id) => {
    try {
        const preference = await Preferences.findOne({ where: { user_id: user_id }, raw: true });
        if (!preference) {
            return {
                statusCode: 404,
                comment: '신규 사용자입니다. 선호도 입력 페이지로 이동합니다.'
            };

        } else {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const times = ['morning', 'afternoon', 'evening'];

            let day_preference = Array.from({length: 7}, () => 0);
            let time_preference = Array.from({length: 3}, () => 0);

            days.forEach((day, index) => {
                day_preference[index] += preference.day_preference[day];
            });

            times.forEach((time, index) => {
                time_preference[index] += preference.time_preference[time];
            });

            const day_max = Math.max(...day_preference);
            const time_max = Math.max(...time_preference);

            const day_max_index = [];
            const time_max_index = [];

            for (let index = 0; index < days.length; index++) {
                if (day_preference[index] === day_max) {
                    day_max_index.push(index);
                };
            };

            for (let index = 0; index < times.length; index++) {
                if (time_preference[index] === time_max) {
                    time_max_index.push(index);
                };
            };

            return {
                statusCode: 200,
                group_preference: {
                    day: day_max_index,
                    time: time_max_index
                }
            };
        };

    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.calculatePreferences = async (group_id) => {
    try {
        const group = await Groups.findOne({where: { id: group_id }, raw: false });
        if (!group) {
            return {
                statusCode: 404,
                comment: '해당 그룹이 존재하지 않습니다.'
            };
        };

        const participants = await Participants.findAll({ where: { group_id: group_id }, raw: true });
        if (participants.length === 0) {
            return {
                statusCode: 404,
                comment: '해당 그룹이 존재하지 않습니다.'
            };

        } else {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const times = ['morning', 'afternoon', 'evening'];
            const headcount = participants.length;
            let users = [];

            // 그룹 참가자 선호도 가져오기
            let all_day_preference = Array.from({length: 7}, () => 0);
            let all_time_preference = Array.from({length: 3}, () => 0);

            for (let participant of participants) {
                const preference = await Preferences.findOne({ where: { user_id: participant.user_id }, raw: true });
                if (!preference) {
                    return {
                        statusCode: 404,
                        comment: '신규 사용자가 존재합니다.'
                    };
                };

                users.push({
                    day_preference: preference.day_preference,
                    time_preference: preference.time_preference
                });

                days.forEach((day, index) => {
                    all_day_preference[index] += (preference.day_preference[day] - 1) / 4;  // 정규화 (max 5, min 1)
                });

                times.forEach((time, index) => {
                    all_time_preference[index] += (preference.time_preference[time] - 1) / 4;   // 정규화 (max 5, min 1)
                });
            };

            console.log(`all_day: ${all_day_preference}`)
            console.log(`all_time: ${all_time_preference}`)

            // 평균 선호도 구하기
            let avg_day_preference = Array.from({length: 7}, () => 0);
            let avg_time_preference = Array.from({length: 3}, () => 0);
            
            days.forEach((day, index) => {
                avg_day_preference[index] = all_day_preference[index] / headcount;
            });

            times.forEach((time, index) => {
                avg_time_preference[index] += all_time_preference[index] / headcount;
            });

            console.log(`avg_day: ${avg_day_preference}`)
            console.log(`avg_time: ${avg_time_preference}`)

            // 선호도 MSD 구하기
            let day_preference_MSD = Array.from({length: 7}, () => 0);
            let time_preference_MSD = Array.from({length: 3}, () => 0);

            for(let user of users) {
                days.forEach((day, index) => {
                    day_preference_MSD[index] += (avg_day_preference[index] - ((user.day_preference[day] - 1) / 4)) ** 2;   // 정규화 (max 5, min 1)
                });
    
                times.forEach((time, index) => {
                    time_preference_MSD[index] += (avg_time_preference[index] - ((user.time_preference[time] - 1) / 4)) ** 2;   // 정규화 (max 5, min 1)
                });
            };

            day_preference_MSD = day_preference_MSD.map((p) => p / headcount);
            time_preference_MSD = time_preference_MSD.map((p) => p / headcount);

            console.log(`day_MSD: ${day_preference_MSD}`)
            console.log(`time_MSD: ${time_preference_MSD}`)

            // 평균 선호도와 선호도 가중치(1-MSD)를 곱한 그룹 선호도 구하기
            let group_day_preference = Array.from({length: 7}, () => 0);
            let group_time_preference = Array.from({length: 3}, () => 0);

            days.forEach((day, index) => {
                group_day_preference[index] = avg_day_preference[index] * (1 - day_preference_MSD[index]);
            });

            times.forEach((time, index) => {
                group_time_preference[index] = avg_time_preference[index] * (1 - time_preference_MSD[index]);
            });

            console.log(`group_day: ${group_day_preference}`)
            console.log(`group_time: ${group_time_preference}`)

            // 그룹 선호도 중 최댓값을 갖는 선호도를 구하기
            const day_max = Math.max(...group_day_preference);
            const time_max = Math.max(...group_time_preference);

            const day_max_index = [];
            const time_max_index = [];

            for (let index = 0; index < days.length; index++) {
                if (group_day_preference[index] === day_max) {
                    day_max_index.push(index);
                };
            };

            for (let index = 0; index < times.length; index++) {
                if (group_time_preference[index] === time_max) {
                    time_max_index.push(index);
                };
            };

            console.log(`day_max_index: ${day_max_index}`)
            console.log(`time_max_index: ${time_max_index}`)

            const auto_group_preference = {
                day: day_max_index,
                time: time_max_index
            };

            return {
                statusCode: 200,
                auto_group_preference: auto_group_preference
            };
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}



exports.generateTimeSlots = (dateList, timeScope) => {
    const planTimeSlot = [];

    // 시간 범위를 분 단위로 변환
    const startTimeInMinutes = parseInt(timeScope.start.replace(':', ''), 10) / 100 * 60;
    const endTimeInMinutes = parseInt(timeScope.end.replace(':', ''), 10) / 100 * 60;

    let index = 0;
    dateList.forEach((date) => {
        planTimeSlot.push({
            date: date,
            time_scope: []
        });

        for (let minutes = startTimeInMinutes; minutes < endTimeInMinutes; minutes += 15) {
            const hours = Math.floor(minutes / 60);
            const startMinute = (minutes % 60).toString().padStart(2, '0');
            const endMinute = ((minutes % 60) + 15).toString().padStart(2, '0');

            const start = `${hours}:${startMinute}`;
            let end = `${hours}:${endMinute}`;
            if (endMinute == 60) {
                end = `${hours + 1}:00`;
            };

            planTimeSlot[index].time_scope.push({
                start: start,
                end: end,
                available: []
            });
        };

        index++;
    });

    return planTimeSlot;
}

exports.createPlan = async (plan) => {
    if (!plan.name || !plan.plan_time_slot || !plan.minimum_user_count || !plan.progress_time || !plan.schedule_deadline) {
        return {
            statusCode: 400,
            comment: '약속 생성에 필요한 정보가 올바르지 않습니다.'
        };
    };

    try {        
        const newPlan = await Plans.create(plan);

        return {
            statusCode: 201,
            plan: newPlan.toJSON()
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.searchPlan = async (id) => {
    try {
        const plans = await Plans.findAll({ where: { group_id: id }, raw: true });
        if (plans.length === 0) {
            return {
                statusCode: 404,
                comment: '생성된 약속이 없습니다.'
            };

        } else {
            return {
                statusCode: 200,
                plans: plans
            };
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.updatePlan = async (plan) => {
    try {
        const changedPlan = await Plans.findOne({ where: { id: plan.id }, raw: false });
        if (!changedPlan) {
            return {
                statusCode: 404,
                comment: '약속이 존재하지 않습니다.'
            };

        } else {
            if (plan.maximum_user_count == changedPlan.toJSON().maximum_user_count) {
                delete plan.maximum_user_count;
            } else {
                if (!plan.maximum_user_count) {
                    plan.maximum_user_count = null;
                };
            };

            const timeDiff = 9 * 60 * 60 * 1000;

            const planDate = new Date(changedPlan.toJSON().schedule_deadline);
            const planTime = planDate.getTime();
            const schedule_deadline = new Date(planTime + timeDiff);

            const inputDate =  new Date(plan.schedule_deadline);
            const inputPlanTime = inputDate.getTime();
            const input_schedule_deadline = new Date(inputPlanTime + timeDiff);

            if (input_schedule_deadline.getTime() == schedule_deadline.getTime()) {
                delete plan.schedule_deadline;
            };

            if (plan.name == changedPlan.toJSON().name) {
                delete plan.name;
            };

            if (plan.minimum_user_count == changedPlan.toJSON().minimum_user_count) {
                delete plan.minimum_user_count;
            };

            if (plan.progress_time == changedPlan.toJSON().progress_time) {
                delete plan.pregress_time;
            };

            if ((plan.maximum_user_count || plan.schedule_deadline) && changedPlan.toJSON().status !== 'submit') {
                return {
                    statusCode: 400,
                    comment: '이미 일정 제출이 마감된 약속입니다.'
                };
            };

            await changedPlan.update(plan);
            await changedPlan.save();

            return {
                statusCode: 200,
                plan: changedPlan.toJSON()
            };
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.updatePlanSchedule = async (user_id, plan_id, submission_time_slot) => {
    try {
        const changedPlan = await Plans.findOne({ where: { id: plan_id }, raw: false });
        if (!changedPlan) {
            return {
                statusCode: 404,
                comment: '일정을 제출할 약속이 없습니다.',
            };

        };
    
        const plan = await Plans.findOne({ where: { id: plan_id }, raw: true });
        let newSchedule = plan.plan_time_slot;
        let date_index = 0;
        for (let slot of submission_time_slot) {
            let time_index = 0;

            for (let time of slot.time_scope) {
                if (time.available) {
                    newSchedule[date_index].time_scope[time_index].available.push(user_id);
                };
    
                time_index++;
            };

            date_index++;
        };

        await changedPlan.update({ plan_time_slot: newSchedule });
        await changedPlan.save();

        return {
            statusCode: 200,
            plan: changedPlan.toJSON()
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err,
        };
    };
}

exports.deletePlanSchedule = async (user_id, plan_id) => {
    try {
        const changedPlan = await Plans.findOne({ where: { id: plan_id }, raw: false });
        if (!changedPlan) {
            return {
                statusCode: 404,
                comment: '일정을 제출할 약속이 없습니다.',
            };

        };
    
        const plan = await Plans.findOne({ where: { id: plan_id }, raw: true });
        let newSchedule = plan.plan_time_slot;
        let date_index = 0;
        for (let slot of plan.plan_time_slot) {
            let time_index = 0;

            for (let time of slot.time_scope) {
                newSchedule[date_index].time_scope[time_index].available = time.available.filter((id) => id !== user_id);
                time_index++;
            };

            date_index++;
        };

        await changedPlan.update({ plan_time_slot: newSchedule });
        await changedPlan.save();

        return {
            statusCode: 200,
            plan: changedPlan.toJSON()
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err,
        };
    };
}

exports.searchPlanInfo = async (id) => {
    try {
        const plan = await Plans.findOne({ where: { id: id }, raw: true });
        if (!plan) {
            return {
                statusCode: 404,
                comment: '생성된 약속이 없습니다.'
            };

        } else {
            return {
                statusCode: 200,
                plan: plan
            };
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}



exports.checkSchedule = async (plan_id, submission_time_slot) => {
    try {
        const plan = await Plans.findOne({ where: { id: plan_id, status: 'submit' }, raw: true });
        if (!plan) {
            return {
                statusCode: 404,
                comment: '일정을 제출할 약속이 없습니다.',
                result: false
            };
        };

        for (let slot of submission_time_slot) {
            if(slot.time_scope.length !== plan.plan_time_slot[0].time_scope.length) {
                return {
                    statusCode: 400,
                    comment: '제출된 일정 형식이 올바르지 않습니다.',
                    result: false
                };
            };
        };

        return {
            result: true
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err,
            result: false
        };
    };
}

exports.createSchedule = async (plan_id, submission) => {
    try {        
        const isSubmit = await Submissions.findOne({ where: { user_id: submission.user_id, plan_id: plan_id }, raw: false });
        if (isSubmit) {
            return {
                statusCode: 409,
                comment: '이미 제출된 일정이 있습니다.',
            };
        };

        const newSchedule = await Submissions.create(submission);

        return {
            statusCode: 201,
            schedule: newSchedule.toJSON()
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.searchSchedules = async (plan_id) => {
    try {
        const submissions = await Submissions.findAll({ where: { plan_id: plan_id }, raw: true });
        if (submissions.length === 0) {
            return {
                statusCode: 404,
                comment: '제출된 일정이 없습니다.'
            };

        } else {
            return {
                statusCode: 200,
                submissions: submissions
            };
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.searchSchedule = async (user_id, plan_id) => {
    try {
        const submission = await Submissions.findOne({ where: { user_id: user_id, plan_id: plan_id }, raw: false });
        if (!submission) {
            return {
                statusCode: 404,
                comment: '제출된 일정이 없습니다.'
            };

        } else {
            return {
                statusCode: 200,
                submission: submission.toJSON()
            };
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}

exports.updateSchedule = async (user_id, plan_id, submission_time_slot) => {
    try {
        const changedSubmission = await Submissions.findOne({ where: { user_id: user_id, plan_id: plan_id }, raw: false });
        if (!changedSubmission) {
            return {
                statusCode: 404,
                comment: '제출된 일정이 없습니다.'
            };

        } else {
            await changedSubmission.update({ submission_time_slot: submission_time_slot });
            await changedSubmission.save();

            return {
                statusCode: 200,
                submission: changedSubmission.toJSON()
            };
        };

    } catch (err) {
        return {
            statusCode: 500,
            comment: err
        };
    };
}



exports.calculateCandidates = async (plan_id) => {
    try {
        const plan = await Plans.findOne({ where: { id: plan_id, status: 'calculate' }, raw: false });
        if (!plan) {
            return {
                statusCode: 404,
                comment: '일정 후보를 계산할 약속이 없습니다.',
            };
        };

        let candidate_plan_time = [];
        const inspectionSize = plan.dataValues.progress_time / 15;
        // 같은 사용자가 연속으로 존재해야할 경우
        for (let slot of plan.dataValues.plan_time_slot) {
            for (let inspectionStart of slot.time_scope) {
                if (slot.time_scope.indexOf(inspectionStart) > (slot.time_scope.length - inspectionSize)) break;
                
                const inspectionTimeArr = slot.time_scope.slice(slot.time_scope.indexOf(inspectionStart), slot.time_scope.indexOf(inspectionStart) + inspectionSize);
                let isContinuousUser = true;
                let isMoreUsersThanMinimum = true;
                if (inspectionSize === 1) {
                    if (inspectionTimeArr[0].available.length < plan.dataValues.minimum_user_count) {
                        isMoreUsersThanMinimum = false;
                    };

                } else {
                    let continuousUserList = [];
                    for (let index = 0; index < inspectionSize; index++) {
                        if (index == 0) {
                            continuousUserList = [...inspectionTimeArr[index].available];
                        } else {
                            const prevUserList = new Set(continuousUserList);
                            const nextUserList = new Set(inspectionTimeArr[index].available);
                            const intersection = new Set([...prevUserList].filter(user => nextUserList.has(user)));

                            continuousUserList = [...intersection];
                        };

                        if (continuousUserList.length < plan.dataValues.minimum_user_count) {
                            isMoreUsersThanMinimum = false;
                        };

                        if (!(isMoreUsersThanMinimum && isContinuousUser)) {
                            break;
                        };
                    };

                };

                if (isMoreUsersThanMinimum && isContinuousUser) {
                    candidate_plan_time.push({
                        start: `${slot.date} ${inspectionTimeArr[0].start}`,
                        end: `${slot.date} ${inspectionTimeArr[inspectionTimeArr.length - 1].end}`,
                    });
                };
                
            };
        };

        if (candidate_plan_time.length === 0) {
            await plan.update({ status: 'fail' });
            await plan.save();
        } else {
            await plan.update({ candidate_plan_time: candidate_plan_time, status: 'select' });
            await plan.save();
        }

        return {
            statusCode: 200,
            candidate_plan_time: candidate_plan_time,
        };

    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            comment: err,
        };
    };
}