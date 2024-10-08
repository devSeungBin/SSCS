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

exports.isGoogleLoggedIn = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (await Users.findOne({ where: { id: req.user.id, provider: 'google' }, raw: true })) {
            next();
        } else {
            req.auth = {};
            req.auth.statusCode = 400;
            req.auth.comment = '소셜 로그인으로 인증된 계정만 사용할 수 있습니다.';
            next();
        };
    } else {
        req.auth = {};
        req.auth.statusCode = 401;
        next();
    };
}

exports.isNotGoogleLoggedIn = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (!await Users.findOne({ where: { id: req.user.id, provider: 'google' }, raw: true })) {
            next();
        } else {
            req.auth = {};
            req.auth.statusCode = 400;
            req.auth.comment = '로컬 로그인으로 인증된 계정만 사용할 수 있습니다.';
            next();
        };
    } else {
        req.auth = {};
        req.auth.statusCode = 401;
        next();
    };
}
