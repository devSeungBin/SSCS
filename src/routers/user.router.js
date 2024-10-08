const express = require('express');
const passport = require('passport');
const { google } = require('googleapis');

const keys = require('../config/keys.config');

const { 
    isLoggedIn, isNotLoggedIn, isGoogleLoggedIn, isNotGoogleLoggedIn,
    isNewUser, isNotNewUser
} = require('../middlewares/auth.middleware');
const { 
    searchUser, createUser, updateUser,
    searchPreference, createPreference, checkDay, checkTime,
    searchPlan,
    generateSchedules
} = require('../handlers/user.handle');

const { handleError } = require('../middlewares/res.middleware');


const router = express.Router();

router.get('/', isLoggedIn, isNotNewUser, async (req, res, next) => {
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
                    statusCode: err.statusCode,
                    comment: err.comment
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
                schema: { $ref: "#/components/schemas/postUsersReq" },
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
    };

    next();
}, handleError);

router.patch('/', isLoggedIn, isNotNewUser, async (req, res, next) => {
    /* 
    #swagger.path = '/users'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '사용자 정보 수정 API (인증 필요)'
    #swagger.description = '사용자 프로필, 선호도 정보 수정 시 사용하는 엔드포인트'
    #swagger.requestBody = {
        in: 'body',
        description: '수정할 사용자 프로필, 선호도 정보',
        required: false,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/patchUsersReq" },
            }
        }
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/patchUsersRes200" }
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
    #swagger.responses[400] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_400" }
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
        const { name, password, calendar_id } = req.body.user;
        const { day_preference, time_preference } = req.body.preference;

        let user = {};
        let preference = {};
        let formError = false;

        if (name) { user.name = name; };
        if (password) { user.password = password; };
        if (calendar_id) { user.calendar_id = calendar_id; };
        if (day_preference) {
            if (checkDay(day_preference)) {
                preference.day_preference = day_preference;
            } else {
                formError = true;
            };
        };
        if (time_preference) {
            if (checkTime(time_preference)) {
                preference.time_preference = time_preference;
            } else {
                formError = true;
            };
        };

        if (!formError) {
            await updateUser(req.user.id, user, preference)
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
                        statusCode: err.statusCode,
                        comment: err.comment
                    }
                };
            });
        } else {
            req.result = {
                error: {
                    statusCode: 400,
                    comment: '선호도 형식이 올바르지 않습니다.'
                }
            };
        };
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
        passport.authenticate(
            'google',
            { scope: [
                'profile',
                'email',
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.events',
                'https://www.googleapis.com/auth/calendar.events.readonly',
                'https://www.googleapis.com/auth/calendar.readonly',
                'https://www.googleapis.com/auth/calendar.settings.readonly'
            ] })(req, res, next);
    };

});

router.get('/login/callback', async (req, res, next) => {   
    /* 
    #swagger.path = '/users/login/callback'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '구글 로그인 리다이렉트 API (직접 사용 안함)'
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
                        statusCode: 500,
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
                        user: info.user,
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
                schema: { $ref: "#/components/schemas/postUsersLoginReq" },
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

router.get('/preferences', isLoggedIn, isNotNewUser, async (req, res, next) => {
    /* 
    #swagger.path = '/users/preferences'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '사용자 선호도 정보 조회 API (인증 필수)'
    #swagger.description = '사용자의 선호도 정보를 반환하는 엔드포인트, 첫 로그인 시 선호도 설정하는데 사용된다.'
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getUsersPreferencesRes200" }
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
        await searchPreference(req.user.id)
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
                    preference: info.preference
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
    
    };

    next();
}, handleError);

router.post('/preferences', isLoggedIn, isNewUser, async (req, res, next) => {
    /* 
    #swagger.path = '/users/preferences'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '사용자 선호도 정보 생성 API (인증 필수)'
    #swagger.description = '사용자의 선호도 정보를 생성하는 엔드포인트, 첫 로그인 시 선호도 설정하는데 사용된다.'
    #swagger.requestBody = {
        in: 'body',
        description: '신규 사용자 선호도 정보',
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/postUsersPreferenceReq" },
            }
        }
    }
    #swagger.responses[201] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/postUsersPreferencesRes201" }
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
        const { day_preference, time_preference } = req.body;

        if (checkDay(day_preference) && checkTime(time_preference)) {
            await createPreference(req.user.id, day_preference, time_preference)
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
                        preference: info.preference
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
        } else {
            req.result = {
                error: {
                    statusCode: 400,
                    comment: '선호도 형식이 올바르지 않습니다.'
                }
            };
        };
    };

    next();
}, handleError);

router.get('/plans', isLoggedIn, isNotNewUser, async (req, res, next) => {
    /* 
    #swagger.path = '/users/plans'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '사용자 개인 약속 조회 API (인증 필수)'
    #swagger.description = '사용자의 약속 목록을 조회하는데 사용된다.'
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getUsersPlansRes200" }
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
        await searchPlan(req.user.id)
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
                    plans: info.plans
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
    
    };

    next();
}, handleError);


router.get('/calendars', isGoogleLoggedIn, isNotNewUser, async (req, res, next) => {
    /* 
    #swagger.path = '/users/calendars'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '캘린더 리스트 조회 API (인증 필수)'
    #swagger.description = '사용자의 캘린더 리스트를 조회하는 엔드포인트'
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getUsersCalendarsRes200" }
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
    #swagger.responses[400] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_400" }
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
        .then(async (info) => {
            if (info.statusCode !== 200) {
                req.result = {
                    error: {
                        statusCode: info.statusCode,
                        comment: info.comment
                    }
                };
            } else {
                const oauth2Client = new google.auth.OAuth2(
                    keys.GOOGLE_CLIENT_ID,
                    keys.GOOGLE_CLIENT_SECRET,
                    keys.GOOGLE_CALENDARS_CALLBACK_URL
                );

                oauth2Client.setCredentials({
                    access_token: info.user.access_token,
                });

                const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

                await calendar.calendarList.list({})
                .then((res) => {
                    req.result = {
                        statusCode: 200,
                        calendarList: res.data
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
        })
        .catch((err) => {
            req.result = {
                error: {
                    statusCode: err.statusCode,
                    comment: err.comment
                }
            };
        });
    
    };

    next();
}, handleError);

router.get('/calendars/freebusy', isGoogleLoggedIn, isNotNewUser, async (req, res, next) => {
    /* 
    #swagger.path = '/users/calendars/freebusy'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '캘린더 리스트 조회 API (인증 필수)'
    #swagger.description = '사용자의 캘린더 리스트를 조회하는 엔드포인트'
    #swagger.parameters['timeMax'] = {
        in: 'query',
        description: 'plan_time_slot의 끝 time',
        required: true,
        type: 'string',
    }
    #swagger.parameters['timeMin'] = {
        in: 'query',
        description: 'plan_time_slot의 시작 time',
        required: true,
        type: 'string',
    }
    #swagger.parameters['dateList'] = {
        in: 'query',
        description: 'plan_time_slot의 date 목록',
        required: true,
        type: 'array',
        schema: ["2024-11-01", "2024-11-03"]
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getUsersCalendarsFreebusyRes200" }
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
    #swagger.responses[400] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_400" }
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
        .then(async (info) => {
            if (info.statusCode !== 200) {
                req.result = {
                    error: {
                        statusCode: info.statusCode,
                        comment: info.comment
                    }
                };
            } else {
                if (!req.query.timeMax || !req.query.timeMin || !req.query.dateList) {
                    req.result = {
                        error: {
                            statusCode: 400,
                            comment: '잘못된 요청입니다.'
                        }
                    };
                } else {
                    const oauth2Client = new google.auth.OAuth2(
                        keys.GOOGLE_CLIENT_ID,
                        keys.GOOGLE_CLIENT_SECRET,
                        keys.GOOGLE_CALENDARS_CALLBACK_URL
                    );
    
                    oauth2Client.setCredentials({
                        access_token: info.user.access_token,
                    });
    
                    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
                    let busyDateInfo = [];
                    let index = 0;
                    for (let date of req.query.dateList) {
                        if (index < 0) break;

                        busyDateInfo.push({
                            date: date,
                            busy_time_scope: null
                        });

                        const calendarId = info.user.calendar_id;
                        const timeMax = `${dateList[index]} ${req.query.timeMax}`;
                        const timeMin = `${dateList[index]} ${req.query.timeMin}`;

                        await calendar.freebusy.query({
                            resource: {
                                timeMax: timeMax,
                                timeMin: timeMin,
                                timeZone: 'Asia/Seoul',
                                items: [{ id: calendarId }]
                            }
                        })
                        .then((res) => {
                            busyDateInfo[index].busy_time_scope.push(res.data.calendars.calendarId.busy);
                        })
                        .catch((err) => {
                            req.result = {
                                error: {
                                    statusCode: 500,
                                    comment: err
                                }
                            };
                            
                            index = -2;
                        });

                        index++;
                    };
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
    
    };

    next();
}, handleError);

router.get('/calendars/callback', async (req, res, next) => {
    /* 
    #swagger.path = '/users/calendars/callback'
    #swagger.tags = ['UserRouter']
    #swagger.summary = '캘린더 관련 리다이렉트 API (직접 사용 안함)'
    #swagger.description = '테스트 엔드포인트'

    #swagger.responses[303] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/response_303" }
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

    // console.log(req);
    // req.result = {};

    // new Promise (async (resolve, reject) => {
    //     // Handle the OAuth 2.0 server response
    //     let q = url.parse(req.url, true).query;
    //     if (q.error) { // An error response e.g. error=access_denied
    //         console.log('Error:' + q.error);
    //         req.result = {
    //             error: {
    //                 statusCode: 500,
    //                 comment: q.error
    //             }
    //         };
    //         resolve();
    //     } else {
    //         req.result = {
    //             statusCode: info.statusCode,
    //             q: q
    //         };
    //         resolve();
    //     }
    // })
    // .then(() => {
    //     next();
    // });

});


module.exports = router;
