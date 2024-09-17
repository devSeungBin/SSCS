const express = require('express');
const { join } = require('path');

const { 
    isLoggedIn, isNotLoggedIn, 
    isNewUser, isNotNewUser
} = require('../middlewares/auth.middleware');
const { 
    isGroupUser
} = require('../middlewares/group.middleware');
const { 
    searchGroup, searchAllGroupUser, createGroup, createInvitationCode, joinGroup, updateGroup
} = require('../handlers/group.handle');

const { handleError } = require('../middlewares/res.middleware');

const router = express.Router();

router.post('/', isLoggedIn, isNotNewUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '새 그룹 생성 API (인증 불필요)'
    #swagger.description = '사용자가 새로운 그룹 생성 시 사용하는 엔드포인트'
    #swagger.requestBody = {
        in: 'body',
        description: '생성할 그룹 정보',
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/postGroupsReq" },
            }
        }
    }
    #swagger.responses[201] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/postGroupsRes201" }
            }           
        }
    }
    #swagger.responses[303] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_303" }
            }           
        }
    }
    #swagger.responses[400] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_400" }
            }           
        }
    }
    #swagger.responses[401] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_401" }
            }           
        }
    }
    #swagger.responses[500] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_500" }
            }           
        }
    }
    */

    req.result = {};

    if (req.auth) {
        req.result = {
            error: {
                statusCode: req.auth.statusCode,
                comment: req.auth.comment
            }
        };

    } else {
        let newGroup = {
            name: req.body.name,
            creator: req.user.id,
        }
    
        await createGroup(newGroup)
        .then((info) => {
            if (info.statusCode !== 201) {
                req.result = {
                    error: {
                        statusCode: info.statusCode,
                        comment: info.comment
                    }
                };
            } else {
                req.result = {
                    statusCode: info.statusCode,
                    group: info.group,
                };
            };
        })
        .catch((err) => {
            req.result = {
                error: {
                    statusCode: 500,
                    comment: err
                }
            };
        });
    };

    next();
}, handleError);
 
router.get('/profile:id', isLoggedIn, isGroupUser, async (req, res, next) => {

    /* 
    #swagger.path = '/group/profile:id'
    #swagger.tags = ['groupRouter']
    #swagger.summary = '그룹 정보 조회 API'
    #swagger.description = '그룹의 정보를 조회할 때 사용하는 엔드포인트'
    #swagger.responses[200] = { description: '정상적으로 그룹 정보가 조회됨' }
    #swagger.responses[500] = { description: '서버 내부 오류' }
    */

    const group = await searchGroup(req.query.id);

    if(group.statusCode === 200) {
        return res.status(200).json({
            msg: "그룹 조회 성공",
            info: group.info,
        });

    } else {
        return res.status(group.statusCode).json({
            msg: "그룹 조회 실패",
        });
    }

});

router.get('/users:id', isLoggedIn, isGroupUser, async (req, res, next) => {

    /* 
    #swagger.path = '/group/users:id'
    #swagger.tags = ['groupRouter']
    #swagger.summary = '그룹 참여자 정보 조회 API'
    #swagger.description = '그룹 참여자 정보를 조회할 때 사용하는 엔드포인트'
    #swagger.responses[200] = { description: '정상적으로 그룹 참여자 정보가 조회됨' }
    #swagger.responses[500] = { description: '서버 내부 오류' }
    */

    const users = await searchAllGroupUser(req.query.id);

    if(users.statusCode === 200) {
        return res.status(200).json({
            msg: "그룹 조회 성공",
            info: users.info,
        });

    } else {
        return res.status(users.statusCode).json({
            msg: "그룹 조회 실패",
        });
    }

});

router.get('/code:id', isLoggedIn, isGroupUser, async (req, res, next) => {

    /* 
    #swagger.path = '/group/code:id'
    #swagger.tags = ['groupRouter']
    #swagger.summary = '그룹 초대코드 생성 API'
    #swagger.description = '그룹 초대코드를 생성할 때 사용하는 엔드포인트'
    #swagger.responses[201] = { description: '정상적으로 그룹 초대코드가 생성됨' }
    #swagger.responses[500] = { description: '서버 내부 오류' }
    */

    const group = await searchGroup(req.query.id);
    const code = await createInvitationCode(group.info);

    if(code.statusCode === 201) {
        return res.status(201).json({
            msg: "그룹 초대코드 생성 성공",
        });

    } else {
        return res.status(code.statusCode).json({
            msg: "그룹 초대코드 생성 실패",
        });
    }

});

router.post('/join', isLoggedIn, async (req, res, next) => {

    /* 
    #swagger.path = '/group/join'
    #swagger.tags = ['groupRouter']
    #swagger.summary = '그룹 참여 API'
    #swagger.description = '사용자가 그룹에 참여할 때 사용하는 엔드포인트'
    #swagger.parameters['body'] = {
        in: 'body',
        description: '그룹 초대코드 정보',
        required: true,
        schema: {
            invitation_code: "invitation_code"
        }
    }
    #swagger.responses[201] = { description: '정상적으로 그룹에 참여됨' }
    #swagger.responses[400] = { description: '잘못된 요청 양식' }
    #swagger.responses[500] = { description: '서버 내부 오류' }
    */

    const { invitation_code } = req.body;

    const newGroupUser = await joinGroup(invitation_code, req.user.id);

    if(newGroupUser.statusCode === 201) {
        return res.status(201).json({
            msg: "그룹 참여 성공",
        });

    } else {
        return res.status(newGroupUser.statusCode).json({
            msg: "그룹 참여 실패",
        });
    }

});

router.post('/modification:id', isLoggedIn, isGroupUser, async (req, res, next) => {

    /* 
    #swagger.path = '/group/modification:id'
    #swagger.tags = ['groupRouter']
    #swagger.summary = '그룹 정보 수정 API'
    #swagger.description = '그룹의 정보를 수정할 때 사용하는 엔드포인트'
    #swagger.parameters['body'] = {
        in: 'body',
        description: '그룹 수정 정보',
        required: true,
        schema: {
            name: "group_name"
        }
    }
    #swagger.responses[201] = { description: '정상적으로 그룹에 참여됨' }
    #swagger.responses[400] = { description: '잘못된 요청 양식' }
    #swagger.responses[500] = { description: '서버 내부 오류' }
    */

    const { name } = req.body;

    const group = await updateGroup(req.query.id, name);

    if(group.statusCode === 201) {
        return res.status(201).json({
            msg: "그룹 정보 수정 성공",
        });

    } else {
        return res.status(group.statusCode).json({
            msg: "그룹 정보 수정 실패",
        });
    }

});



module.exports = router;
