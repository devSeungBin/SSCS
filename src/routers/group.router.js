const express = require('express');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares/auth.middleware');
const { isGroupUser } = require('../middlewares/group.middleware');
const { searchGroup, searchAllGroupUser, createGroup } = require('../handlers/group.handle');


const router = express.Router();

router.post('/create', isLoggedIn, async (req, res, next) => {

    /* 
    #swagger.path = '/group/create'
    #swagger.tags = ['groupRouter']
    #swagger.summary = '그룹 생성 API'
    #swagger.description = '사용자가 그룹을 생성할 때 사용하는 엔드포인트'
    #swagger.parameters['body'] = {
        in: 'body',
        description: '생성할 그룹 정보',
        required: true,
        schema: {
            name: "group_name"
        }
    }
    #swagger.responses[201] = { description: '정상적으로 그룹이 생성됨' }
    #swagger.responses[400] = { description: '잘못된 요청 양식' }
    #swagger.responses[500] = { description: '서버 내부 오류' }
    */

    let newGroup = {
        name: req.body.name,
        creator: req.user.id,
    }

    newGroup = await createGroup(newGroup);

    if(newGroup.statusCode === 201) {
        return res.status(201).json({
            msg: "그룹 생성 성공",
            info: newGroup.info,
        });

    } else {
        return res.status(newGroup.statusCode).json({
            msg: "그룹 생성 실패",
        });
    }

 });
 
 router.get('/:id/profile', isLoggedIn, isGroupUser, async (req, res, next) => {

    /* 
    #swagger.path = '/group/:id/profile'
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

router.get('/:id/users', isLoggedIn, isGroupUser, async (req, res, next) => {

    /* 
    #swagger.path = '/group/:id/users'
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


module.exports = router;
