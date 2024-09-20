const crypto = require('crypto');
const db = require('../models/index.db');
const { group } = require('console');
const { Groups, Participants, Plans } = db;

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
        
        const participant = await Participants.create({ user_id: id, group_id: group.id });
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

exports.createPlan = async (plan) => {
    if (!plan.name || !plan.submission_time_scope ||
        !plan.minimum_user_count || !plan.progress_time || !plan.deadline) {
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