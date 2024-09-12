const crypto = require('crypto');
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

exports.createInvitationCode = async (group) => {
    try {
        new Promise((resolve, reject) => {
            crypto.randomBytes(64, async (err, buf) => {
                if (err) {
                    reject(err);
                }
                const today = new Date();

                crypto.pbkdf2(
                    `${group.name}${group.id}${group.user_count}${today.toLocaleDateString('en-US')}`, 
                    buf.toString('base64'), 9999, 9, 'sha512', async (err, key) => {
                    if (err) {
                        reject(err);
                    }
                    resolve([buf.toString('base64'), key.toString('base64')]);
                });
            });
        })
        .then(async ([salt, invitation_code]) => {
            const reGroup = await Groups.findOne({ where: { id: group.id }, raw: false }); 

            await reGroup.update({ invitation_code: invitation_code });
            await reGroup.save();
        })
        .catch((err) => {
            return {
                statusCode: 500,    // db 내부 오류
            };
        });

        return {
            statusCode: 201,    // db에 salt 추가
        };

    } catch (err) {
        return {
            statusCode: 500,    // db 내부 오류
        };
    }
}

exports.joinGroup = async (invitation_code, user_id) => {
    try { 
        const group = await Groups.findOne({ where: { invitation_code: invitation_code }, raw: true });
        if(!group) {
            return {
                statusCode: 400,    // 초대코드에 해당하는 그룹이 존재하지 않음
            };
        }

        if(await GroupUsers.findOne({ where: { user_id: user_id, group_id: group.id } })) {
            return {
                statusCode: 400,    // 이미 그룹에 참여함
            };
        }
        
        await GroupUsers.create({ user_id: user_id, group_id: group.id });

        const reGroup = await Groups.findOne({ where: { id: group.id }, raw: false }); 

        await reGroup.update({ user_count: ++group.user_count });
        await reGroup.save();
        
        return {
            statusCode: 201,    // 그룹에 사용자 추가
        };

    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,    // db 내부 오류
        };
    }
}

exports.updateGroup = async (group_id, name) => {
    try {
        const group = await Groups.findOne({ where: { id: group_id }, raw: false });
        
        await group.update({ name: name });
        await group.save();

        return {
            statusCode: 201,    // 그룹 정보가 변경됨
            info: group,
        };

    } catch (err) {
        return {
            statusCode: 500,    // db 내부 오류
        };
    }
}
