const express = require('express');
const router = express.Router();

const db = require('../models/index.db');
const { User } = db;

router.get('/', async (req, res) => {

    /* 
    #swagger.path = '/test'
    #swagger.tags = ['testRouter']
    #swagger.summary = '실험용 라우터'
    #swagger.description = '여러 기능을 실험하는 테스트 라우터. 아무것도 없다.'
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'User ID.',
        required: true,
        type: 'integer'
    }

    #swagger.parameters['body'] = {
        in: 'body',
        description: 'User data.',
        required: true,
        schema: {
            username: "user",
            password: "1234"
        }
    }
    #swagger.responses[200] = { description: '요청 성공 응답' }
    #swagger.responses[201] = { description: '요청 성공 응답, 자원 생성 됨' }
    #swagger.responses[500] = { description: '서버 내부 오류' }
    */

    res.send('ok')
});

module.exports = router;
