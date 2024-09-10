const db = require('../models/index.db');
const { Groups, GroupUsers } = db;

exports.searchGroup = async (group_id) => {
    try {
        const group = await Groups.findOne({ where: { id: group_id }, raw: true });

        return {
            statusCode: 200,    // 그룹 검색 완료
            info: group,
        };    

    } catch (err) {
        return {
            statusCode: 500,    // db 내부 오류
        };
    }
}

exports.searchAllGroupUser = async (group_id) => {
    try {
        const group_users = await GroupUsers.findAll({ where: { group_id: group_id }, raw: true });

        return {
            statusCode: 200,    // 그룹 참여자 검색 완료
            info: group_users,
        };

    } catch (err) {
        return {
            statusCode: 500,    // db 내부 오류
        };
    }
}

exports.createGroup = async (group) => {
    if (!group.name || !group.creator) {
        return {
            statusCode: 400,    // 잘못된 그룹 정보
        };
    }

    try {        
        const newGroup = await Groups.create(group);
        await GroupUsers.create({ user_id: group.creator, group_id: newGroup.id });

        return {
            statusCode: 201,    // db에 그룹 추가
            info: newGroup,
        };

    } catch (err) {
        return {
            statusCode: 500,    // db 내부 오류
        };
    }
}
