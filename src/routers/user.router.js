const express = require('express');
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn, isNewUser } = require('../middlewares/auth.middleware');
const { searchUser, createUser } = require('../handlers/user.handle');

const { handleError } = require('../middlewares/res.middleware');


const router = express.Router();

router.get('/', isLoggedIn, isNewUser, async (req, res, next) => {
    /* 
    #swagger.path = '/users'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '사용자 정보 조회 API (인증 필수)'
    #swagger.description = '사용자의 정보를 반환하는 엔드포인트'
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getUsersRes200" }
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
    #swagger.responses[401] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_401" }
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

    if (req.auth) {
        req.result = {
            error: {
                statusCode: req.auth.statusCode,
                comment: req.auth.comment
            }
        };

    } else {
        await searchUser(req.user.id)
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
                    user: info.user,
                    preference: info.preference
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

router.post('/', isNotLoggedIn, async (req, res, next) => {
    /* 
    #swagger.path = '/users'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '사용자 로컬 회원가입 API (인증 불필요)'
    #swagger.description = '사용자가 로컬 회원가입 시 사용하는 엔드포인트'
    #swagger.requestBody = {
        in: 'body',
        description: '회원가입할 사용자 정보',
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/postUsers" },
            }
        }
    }
    #swagger.responses[201] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/postUsersRes201" }
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
    #swagger.responses[409] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_409" }
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
        await createUser(req.body)
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
                    user: info.user,
                    preference: info.preference
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

router.get('/login', isNotLoggedIn, (req, res, next) => {
    /* 
    #swagger.path = '/users/login'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '구글 로그인 API (인증 불필요)'
    #swagger.description = '사용자가 구글 계정으로 로그인할 때 구글 로그인 URL을 반환하는 엔드포인트'
    #swagger.responses[409] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_409" }
            }           
        }
    }
    */

    req.result = {};

    if (req.auth) {
        return res.status(req.auth.statusCode).json({ 
            result: {
                statusCode: '409',
                comment: '이미 로그인 중입니다.',
                message: '요청된 자원이 이미 서버에 존재합니다.'
            }
        });

    } else {
        passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    };

});

router.get('/login/callback', async (req, res, next) => {   

    /* 
    #swagger.path = '/users/login/callback'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '구글 로그인 리다이렉트 API (인증 불필요)'
    #swagger.description = '클라이언트가 구글 인증 서버에서 인증 코드를 받은 후 리다이렉트되는 엔드포인트, 여기서 구글 로그인 전략이 적용된다.'
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getUsersLoginCallbackRes200" }
            }           
        }
    }
    #swagger.responses[201] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getUsersLoginCallbackRes201" }
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

    new Promise (async (resolve, reject) => {
        await passport.authenticate('google', (err, user, info) => {
            // done(err)
            if (err) {
                req.result = {
                    error: {
                        statusCode: info.statusCode,
                        comment: err
                    }
                };
                resolve();
            };
    
            // done(null, user, { statusCode: 2XX })
            return req.login(user, (err) => {
                if (err) {
                    req.result = {
                        error: {
                            statusCode: 500,
                            comment: err
                        }
                    };

                };
    
                if (info.statusCode === 200) {
                    req.result = {
                        statusCode: info.statusCode,
                        passport: req.session.passport,
                    };
    
                } else {
                    req.result = {
                        statusCode: info.statusCode,
                        passport: req.session.passport,
                        user: info.user,
                        preference: info.preference
                    };

                };

                resolve();
            });
        })(req, res, next);
    })
    .then(() => {
        next();
    });

}, handleError);

router.post('/login', isNotLoggedIn, async (req, res, next) => {
    /* 
    #swagger.path = '/users/login'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '로컬 로그인 API (인증 불필요)'
    #swagger.description = '사용자가 로컬 계정으로 로그인할 때 사용하는 엔드포인트, 여기서 로컬 로그인 전략이 적용된다.'
    #swagger.requestBody = {
        in: 'body',
        description: '로그인할 사용자 정보',
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/postUsersLogin" },
            }
        }
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/postUsersLoginRes200" }
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
    #swagger.responses[404] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_404" }
            }           
        }
    }
    #swagger.responses[409] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_409" }
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

        next();

    } else {
        new Promise ((resolve, reject) => {
            passport.authenticate('local', (err, user, info) => {

                // done(err)
                if (err) {
                    req.result = {
                        error: {
                            statusCode: info.statusCode,
                            comment: err
                        }
                    };

                    resolve();
                };
        
                // done(null, false, { statusCode: 4XX })
                if (!user) {
                    req.result = {
                        error: {
                            statusCode: info.statusCode,
                            comment: info.comment
                        }
                    };

                    resolve();
                };
        
                // done(null, user, { statusCode: 200 })
                return req.login(user, (err) => {
                    if (err) {
                        req.result = {
                            error: {
                                statusCode: 500,
                                comment: err
                            }
                        };
                    } else {
                        req.result = {
                            statusCode: info.statusCode,
                            passport: req.session.passport,
                        };
                    };
                    
                    resolve();
                });
            })(req, res, next);
        })
        .then(() => {
            next();
        });
    };

}, handleError);

router.post('/logout', isLoggedIn, (req, res, next) => {
    /* 
    #swagger.path = '/users/logout'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '로그아웃 API (인증 필수)'
    #swagger.description = '로그아웃 시 사용하는 엔드포인트'
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/postUsersLogoutRes200" }
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

        next();

    } else {
        new Promise ((resolve, reject) => {
            req.logout((err) => {
                if (err) {
                    req.result = {
                        error: {
                            statusCode: 500,
                            comment: err
                        }
                    };
                    
                } else {
                    req.result = {
                        statusCode: 200,
                        message: '로그아웃에 성공했습니다.'
                    };
                };

                resolve();
        
            });
        })
        .then(() => {
            next();
        });
    };

}, handleError);


module.exports = router;
