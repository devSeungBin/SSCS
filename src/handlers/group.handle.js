const crypto = require('crypto');
const db = require('../models/index.db');
const { Groups, Participants, Plans, Submissions } = db;

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
            if (group.name) {
                await changedGroup.update({ name: group.name });
                await changedGroup.save();
            };

            if (group.invitation_code) {
                await changedGroup.update({ invitation_code: group.invitation_code });
                await changedGroup.save();
            };

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
            if (plan.name) {
                await changedPlan.update({ name: plan.name });
                await changedPlan.save();
            };

            if (plan.minimum_user_count) {
                await changedPlan.update({ minimum_user_count: plan.minimum_user_count });
                await changedPlan.save();
            };

            if (plan.progress_time) {
                await changedPlan.update({ progress_time: plan.progress_time });
                await changedPlan.save();
            };

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