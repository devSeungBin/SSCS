const db = require('../models/index.db');
const { Participants } = db;

exports.isGroupUser = async (req, res, next) => {
    if(req.user && req.query.group_id) {
        if (await Participants.findOne({ where: { user_id: req.user.id, group_id: req.query.group_id }, raw: true })) {
            next();
        } else {
            req.auth = {};
            req.auth.statusCode = 404;
            req.auth.comment = '해당 그룹이 존재하지 않거나 그룹 참여자가 아닙니다.';
            next();
        };
    } else {
        next();
    };
}

exports.isNotGroupUser = async (req, res, next) => {
    if(req.user && req.query.group_id) {
        if (!await Participants.findOne({ where: { user_id: req.user.id, group_id: req.query.group_id }, raw: true })) {
            next();
        } else {
            req.auth = {};
            req.auth.statusCode = 409;
            req.auth.comment = '이미 해당 그룹의 참여자입니다.';
            next();
        };
    } else {
        next();
    };
}

