const db = require('../models/index.db');
const { Users, Preferences } = db;

exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.auth = {};
        req.auth.statusCode = 401;
        next();
    };
}

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        req.auth = {};
        req.auth.statusCode = 409;
        req.auth.comment = '이미 로그인 중입니다.';
        next();
    };
}

exports.isNewUser = async (req, res, next) => {
    if(req.user) {
        if (!await Preferences.findOne({ where: { user_id: req.user.id }, raw: true })) {
            next();
        } else {
            req.auth = {};
            req.auth.statusCode = 409;
            req.auth.comment = '신규 사용자가 아닙니다. 사용자 홈으로 이동합니다.';
            next();
        };
    } else {
        next();
    };
}

exports.isNotNewUser = async (req, res, next) => {
    if (req.user) {
        if (await Preferences.findOne({ where: { user_id: req.user.id }, raw: true })) {
            next();
        } else {
            req.auth = {};
            req.auth.statusCode = 303;
            req.auth.comment = '신규 사용자입니다. 선호도 입력 페이지로 이동합니다.';
            next();
        };
    } else {
        next();
    };
}