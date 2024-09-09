const express = require('express');
const router = express.Router();

const db = require('../models/index.db');
const { Users, Preferences } = db;

router.get('/session', async (req, res) => {

    // 더 많은 swagger-autugen 문법을 살펴보려면
    // https://swagger-autogen.github.io/docs 를 참조

    /* 
    #swagger.path = '/test/session'
    #swagger.tags = ['testRouter']
    #swagger.summary = '세션 실험용 API'
    #swagger.description = '로그인 세션 확인용 엔드포인트'

    #swagger.responses[200] = { description: '요청 성공 응답' }
    */

    return res.status(200).json({
        msg: "세션 확인 메세지",
        info: {
            session: req.session,
            user: req.user,
        },
    });
});

module.exports = router;
