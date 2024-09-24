const express = require('express');

const { 
    updatePlan
} = require('../handlers/plan.handle');
const { handleError } = require('../middlewares/res.middleware');

const router = express.Router();


router.get('/', async (req, res, next) => {
    /* 
    #swagger.path = '/plans'
    #swagger.tags = ['PlanRouter']
    #swagger.summary = '약속 상태 업데이트 API (인증 필요)'
    #swagger.description = '서버가 약속의 상태를 업데이트하기 위한 엔드포인트'
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getPlansRes200" }
            }           
        }
    }
    #swagger.responses[404] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_404" }
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

    await updatePlan()
    .then((info) => {
        if (info.statusCode !== 200) {
            req.result = {
                error: {
                    statusCode: info.statusCode,
                    comment: info.comment
                }
            };
        } else {
            req.result = {
                statusCode: info.statusCode,
            };
        };
    })
    .catch((err) => {
        req.result = {
            error: {
                statusCode: err.statusCode,
                comment: err.comment
            }
        };
    });

    next();
}, handleError);

module.exports = router;
