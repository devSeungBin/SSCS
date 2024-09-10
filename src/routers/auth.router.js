const express = require('express');
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares/auth.middleware');
const { searchUser, createUser } = require('../handlers/auth.handle');


const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {

    /* 
    #swagger.path = '/auth/join'
    #swagger.tags = ['authRouter']
    #swagger.summary = '로컬 회원가입 API'
    #swagger.description = '사용자가 로컬 회원가입할 때 사용하는 엔드포인트'
    #swagger.parameters['body'] = {
        in: 'body',
        description: '회원가입할 유저 정보',
        required: true,
        schema: {
            name: "user_name",
            email: "user_email",
            password: "user_password"
        }
    }
    #swagger.responses[201] = { description: '정상적으로 회원가입 처리됨' }
    #swagger.responses[400] = { description: '잘못된 요청 양식' }
    #swagger.responses[500] = { description: '서버 내부 오류' }
    */

    const { name, email, password } = req.body;

    const user = await searchUser(email, 'local');

    if(user.statusCode === 400) {
        const user = {
            name: name,
            email: email,
            password: password,
            provider: 'local',
        };

        const newUser = await createUser(user);

        if(newUser.statusCode === 201) {
            return res.status(201).json({
                msg: "회원가입 성공",
                info: user,
            });

        } else {
            return res.status(newUser.statusCode).json({
                msg: "회원가입 실패",
            });
        }

    } else {
        return res.status(user.statusCode).json({
            msg: "회원가입 실패",
        });
    }

 });
 
 router.post('/login', isNotLoggedIn, async (req, res, next) => {

    /* 
    #swagger.path = '/auth/login'
    #swagger.tags = ['authRouter']
    #swagger.summary = '로컬 로그인 API'
    #swagger.description = '사용자가 로컬 로그인할 때 사용하는 엔드포인트'
    #swagger.parameters['body'] = {
        in: 'body',
        description: '로그인할 유저 정보',
        required: true,
        schema: {
            email: "user_email",
            password: "user_password",
        }
    }
    #swagger.responses[200] = { description: '정상적으로 로그인 처리됨' }
    #swagger.responses[400] = { description: '잘못된 요청 양식' }
    #swagger.responses[500] = { description: '서버 내부 오류' }
    */

    passport.authenticate('local', (err, user, info) => {
        // done(err)
        if (err) {
            return res.status(500).json({
                msg: "로그인 실패",
                info: err,
            });
        }

        // done(null, false, { message: '아이디 또는 비밀번호가 일치하지 않음' })
        if (!user) {
            return res.status(400).json({
                msg: "로그인 실패",
                info: info.message,
            });
        }

        // done(null, User)
        return req.login(user, (err) => {
            if (err) {
                return res.status(400).json({
                    msg: "로그인 실패(세션)",
                    info: loginError,
                });
            }

            return res.status(200).json({
                msg: "로그인 성공",
                info: req.session,
            });
        });
    })(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res, next) => {

    /* 
    #swagger.path = '/auth/logout'
    #swagger.tags = ['authRouter']
    #swagger.summary = '로그아웃 API'
    #swagger.description = '사용자가 로그아웃할 때 사용하는 엔드포인트'

    #swagger.responses[200] = { description: '정상적으로 로그인 처리됨' }
    */

    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                msg: "로그아웃 실패",
                info: err,
            });
        } else {
            res.status(200).json({
                msg: "로그아웃 성공",
                info: req.session,
            });
        }
    });
});

router.get('/google', isNotLoggedIn, (req, res, next) => {

    /* 
    #swagger.path = '/auth/google'
    #swagger.tags = ['authRouter']
    #swagger.summary = '구글 로그인 API'
    #swagger.description = '사용자가 구글 로그인할 때 사용하는 엔드포인트'

    #swagger.responses[200] = { description: '정상적으로 로그인 처리됨' }
    */

    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {

        /* 
        #swagger.path = '/auth/google/callback'
        #swagger.tags = ['authRouter']
        #swagger.summary = '구글 로그인 리다이렉트 API'
        #swagger.description = '클라이언트가 구글 인증 서버에서 인증 코드를 받기 위한 엔드포인트, 클라이언트로부터 요청이 다이렉트로 들어오지 않는 주소'

        #swagger.responses[200] = { description: '정상적으로 로그아웃됨' }
        */

        return res.status(200).json({
            msg: "로그인 성공",
            info: req.session,
        });
    },
);


module.exports = router;
