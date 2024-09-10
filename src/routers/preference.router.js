const express = require('express');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares/auth.middleware');
const { searchPreference, updatePreference, checkPreference } = require('../handlers/preference.handle');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res, next) => {

    /* 
    #swagger.path = '/preference'
    #swagger.tags = ['preferenceRouter']
    #swagger.summary = '선호도 조회 API'
    #swagger.description = '사용자가 자신의 선호도를 조회할 때 사용하는 엔드포인트'

    #swagger.responses[200] = { description: '정상적으로 선호도 조회됨' }
    #swagger.responses[500] = { description: '서버 내부 오류' }
    */

    const preference = await searchPreference(req.user.id);

    if(preference.statusCode === 200) {

        return res.status(200).json({
            msg: "선호도 조회 성공",
            info: preference,
        });

    } else {
        return res.status(preference.statusCode).json({
            msg: "선호도 조회 실패",
        });
    }

 });

 router.post('/', isLoggedIn, async (req, res, next) => {

    /* 
    #swagger.path = '/preference'
    #swagger.tags = ['preferenceRouter']
    #swagger.summary = '선호도 수정 API'
    #swagger.description = '사용자가 자신의 선호도를 수정할 때 사용하는 엔드포인트'
    #swagger.parameters['body'] = {
        in: 'body',
        description: '수정할 선호도 정보',
        required: true,
        schema: {
            day_preference: {
                Mon: 3,
                Tue: 3,
                Wed: 3,
                Thu: 3,
                Fri: 3,
                Sat: 3,
                Sun: 3,
            },
            time_preference: {
                am: 3,
                pm: 3,
            },
        }
    }
    #swagger.responses[201] = { description: '정상적으로 선호도 수정됨' }
    #swagger.responses[400] = { description: '잘못된 요청 양식' }
    #swagger.responses[500] = { description: '서버 내부 오류' }
    */

    const { day_preference, time_preference } = req.body;
    const user = req.user.dataValues;

    if(!checkPreference(day_preference, time_preference)) {
        return res.status(400).json({
            msg: "선호도 수정 실패",
        });
    }

    const result = await updatePreference(user.id, day_preference, time_preference);

    if(result.statusCode === 201) {

        return res.status(201).json({
            msg: "선호도 수정 성공",
            info: result.info,
        });

    } else {
        return res.status(result.statusCode).json({
            msg: "선호도 수정 실패",
        });
    }
 });


module.exports = router;
