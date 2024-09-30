const express = require('express');

const { 
    isLoggedIn, isNotLoggedIn, 
    isNewUser, isNotNewUser
} = require('../middlewares/auth.middleware');
const { 
    isGroupUser, isNotGroupUser
} = require('../middlewares/group.middleware');
const { 
    searchGroup, createGroup, updateGroup, 
    searchGroupInfo,
    createInvitationCode, joinGroup,
    calculatePreferences, createPreferences,
    searchParticipant,
    createPlan, searchPlan, updatePlan, updatePlanSchedule, deletePlanSchedule,
    searchPlanInfo,
    generateTimeSlots,
    checkSchedule, createSchedule, searchSchedules, searchSchedule, updateSchedule,
    calculateCandidates
} = require('../handlers/group.handle');

const { handleError } = require('../middlewares/res.middleware');


const router = express.Router();

router.get('/', isLoggedIn, isNotNewUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '참여한 그룹 정보 조회 API (인증 필요)'
    #swagger.description = '사용자가 참여한 그룹 목록을 조회할 때 사용하는 엔드포인트'
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getGroupsRes200" }
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
        await searchGroup(req.user.id)
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
                    groups: info.groupList,
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

router.post('/', isLoggedIn, isNotNewUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '새 그룹 생성 API (인증 필요)'
    #swagger.description = '사용자가 새로운 그룹 생성 시 사용하는 엔드포인트'
    #swagger.requestBody = {
        in: 'body',
        description: '생성할 그룹 정보',
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/postGroupsReq" },
            }
        }
    }
    #swagger.responses[201] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/postGroupsRes201" }
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
        await createPreferences(req.user.id)
        .then(async (info) => {
            if (info.statusCode !== 200) {
                req.result = {
                    error: {
                        statusCode: info.statusCode,
                        comment: info.comment
                    }
                };
            } else {
                let newGroup = {
                    name: req.body.name,
                    creator: req.user.id,
                    preference_setting: 'auto',
                    manual_group_preference: info.group_preference,
                }
            
                await createGroup(newGroup)
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
                            group: info.group,
                        };
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

router.get('/:group_id', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '단일 그룹 정보 조회 API (인증 필수)'
    #swagger.description = '그룹의 정보를 조회할 때 사용하는 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '정보를 조회할 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getGroupsIdRes200" }
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
        await searchGroupInfo(req.query.group_id)
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
                    group: info.group
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

router.patch('/:group_id', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '그룹 정보 수정 API (인증 필수)'
    #swagger.description = '그룹의 정보를 수정할 때 사용하는 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '참여자 정보를 조회할 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.requestBody = {
        in: 'body',
        description: '수정할 그룹 정보',
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/patchGroupsIdReq" },
            }
        }
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/patchGroupsIdRes200" }
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
        const { name, invitationCode,
            preference_setting, manual_group_preference } = req.body;

        let group = {};
        let formError = false;

        if (!req.query.group_id) {
            formError = true;
        } else {
            group.id = req.query.group_id;

            if (name) { group.name = name; };
            if (invitationCode) { group.invitation_code = invitationCode; };
            if (preference_setting === 'manual') { 
                group.preference_setting = preference_setting;
                group.manual_group_preference = manual_group_preference;
            } else {
                group.preference_setting = preference_setting;
            };
        };
        

        if (!formError) {
            await updateGroup(group)
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
                        group: info.group
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
                    comment: '그룹 정보가 올바르지 않습니다.'
                }
            };
        };
    };

    next();
}, handleError);

router.get('/:group_id/members', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id/members'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '그룹 참여자 정보 조회 API (인증 필요)'
    #swagger.description = '그룹 참여자 정보를 조회할 때 사용하는 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '참여자 정보를 조회할 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getGroupsIdMembersRes200" }
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
        await searchParticipant(req.query.group_id)
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
                    participants: info.participants,
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

router.post('/members', isLoggedIn, isNotNewUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/members'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '그룹 참여자 생성(그룹 참여) API (인증 필요)'
    #swagger.description = '초대코드로 그룹에 참여할 때 사용하는 엔드포인트'
    #swagger.requestBody = {
        in: 'body',
        description: '참여할 그룹의 초대코드',
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/postGroupsMembersReq" },
            }
        }
    }
    #swagger.responses[201] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/postGroupsMembers201" }
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
        await joinGroup(req.user.id, req.body.invitationCode)
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
                    participant: info.participant,
                };
            };
        })
        .catch((err) => {
            return {
                statusCode: err.statusCode,
                comment: err.comment
            };
        });
    };

    next();
}, handleError);

router.get('/:group_id/invite', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id/invite'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '그룹 참여코드 생성 및 조회 API (인증 필요)'
    #swagger.description = '그룹 참여코드를 생성하고 조회할 때 사용하는 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '참여코드를 조회할 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getGroupsIdInviteRes200" }
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
        await createInvitationCode(req.query.group_id)
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
                    invitationCode: info.invitation_code,
                };
            };
        })
        .catch((err) => {
            return {
                statusCode: err.statusCode,
                comment: err.comment
            };
        });
    };

    next();
}, handleError);

router.get('/:group_id/preferences', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id/preferences'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '테스트용 그룹 선호도 계산 API (인증 필요)'
    #swagger.description = '그룹 선호도를 계산할 때 사용하는 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '그룹 선호도를 게산할 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getGroupsIdPreferencesRes200" }
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
        await calculatePreferences(req.query.group_id)
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
                    auto_group_preference: info.auto_group_preference,
                };
            };
        })
        .catch((err) => {
            return {
                statusCode: err.statusCode,
                comment: err.comment
            };
        });
    };

    next();
}, handleError);


router.get('/:group_id/plans', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id/plans'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '그룹 약속 목록 조회 API (인증 필요)'
    #swagger.description = '그룹 내에서 약속 조회 시 사용하는 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '약속을 조회할 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getGroupsIdPlansRes200" }
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
        await searchPlan(req.query.group_id)
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

router.post('/:group_id/plans', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id/plans'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '그룹 약속 생성 API (인증 필요)'
    #swagger.description = '그룹 내에서 약속 생성 시 사용하는 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '약속을 생성할 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.requestBody = {
        in: 'body',
        description: '생성할 약속 정보',
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/postGroupsIdPlansReq" },
            }
        }
    }
    #swagger.responses[201] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/postGroupsIdPlansRes201" }
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
        const planTimeSlot = generateTimeSlots(req.body.date_list, req.body.time_scope);

        let newPlan = {
            name: req.body.name,
            group_id: req.query.group_id,
            plan_time_slot: planTimeSlot,
            minimum_user_count: req.body.minimum_user_count,
            progress_time: req.body.progress_time,
            schedule_deadline: req.body.schedule_deadline,
            status: 'submit'
        }
    
        await createPlan(newPlan)
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
                    plan: info.plan,
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

router.get('/:group_id/plans/:plan_id', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id/plans/:plan_id'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '약속 정보 조회 API (인증 필요)'
    #swagger.description = '그룹 내에서 특정 약속 정보 조회 시 사용하는 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '약속이 속한 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.parameters['plan_id'] = {
        in: 'query',
        description: '조회할 약속 id',
        required: true,
        type: 'integer',
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getGroupsIdPlansIdRes200" }
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
        await searchPlanInfo(req.query.plan_id)
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
                    plan: info.plan
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

router.patch('/:group_id/plans/:plan_id', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id/plans/:plan_id'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '그룹 약속 수정 API (인증 필요)'
    #swagger.description = '그룹 내에서 약속 정보 수정 시 사용하는 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '약속이 속한 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.parameters['plan_id'] = {
        in: 'query',
        description: '수정할 약속 id',
        required: true,
        type: 'integer',
    }
    #swagger.requestBody = {
        in: 'body',
        description: '수정할 약속 정보',
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/patchGroupsIdPlansIdReq" },
            }
        }
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/patchGroupsIdPlansIdRes200" }
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
        const { name, minimum_user_count, progress_time, schedule_deadline } = req.body;

        let plan = {};
        let formError = false;

        if (!req.query.plan_id) {
            formError = true;
        } else {
            plan.id = req.query.plan_id;

            if (name) { plan.name = name; };
            if (minimum_user_count) { plan.minimum_user_count = minimum_user_count; };
            if (progress_time) { plan.progress_time = progress_time; };
            if (schedule_deadline) { plan.schedule_deadline = schedule_deadline; };
        };
        

        if (!formError) {
            await updatePlan(plan)
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
                        plan: info.plan
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
                    comment: '약속 정보가 올바르지 않습니다.'
                }
            };
        };
    };

    next();
}, handleError);

router.get('/:group_id/plans/:plan_id/schedules', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id/plans/:plan_id/schedules'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '제출된 모든 일정 확인 API (인증 필요)'
    #swagger.description = '약속에 제출된 모든 일정을 확인하기 위한 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '약속이 속한 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.parameters['plan_id'] = {
        in: 'query',
        description: '제출된 모든 일정을 확인할 약속 id',
        required: true,
        type: 'integer',
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getGroupsIdPlansIdSchedulesRes200" }
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
        await searchSchedules(req.query.plan_id)
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
                    submissions: info.submissions,
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

router.post('/:group_id/plans/:plan_id/schedules', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id/plans/:plan_id/schedules'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '일정 제출 API (인증 필요)'
    #swagger.description = '사용자의 일정을 제출하기 위한 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '약속이 속한 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.parameters['plan_id'] = {
        in: 'query',
        description: '일정을 제출할 약속 id',
        required: true,
        type: 'integer',
    }
    #swagger.requestBody = {
        in: 'body',
        description: '제출할 일정 정보',
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/postGroupsIdPlansIdSchedulesReq" },
            }
        }
    }
    #swagger.responses[201] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/postGroupsIdPlansIdSchedulesRes201" }
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
        const check = await checkSchedule(req.query.plan_id, req.body.submission_time_slot);

        if (!check.result) {
            req.result = {
                error: {
                    statusCode: check.statusCode,
                    comment: check.comment
                }
            };
        } else {
            const submission = {
                user_id: req.user.id,
                plan_id: req.query.plan_id,
                submission_time_slot: req.body.submission_time_slot
            };

            await createSchedule(req.query.plan_id, submission)
            .then(async (info) => {
                if (info.statusCode !== 201) {
                    req.result = {
                        error: {
                            statusCode: info.statusCode,
                            comment: info.comment
                        }
                    };
                } else {
                    await updatePlanSchedule(req.user.id, req.query.plan_id, req.body.submission_time_slot)
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
                                plan: info.plan,
                            };
                        }
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
    };

    next();
}, handleError);

router.patch('/:group_id/plans/:plan_id/schedules', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id/plans/:plan_id/schedules'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '개별 일정 수정 API (인증 필요)'
    #swagger.description = '사용자의 일정을 수정하기 위한 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '약속이 속한 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.parameters['plan_id'] = {
        in: 'query',
        description: '일정을 수정할 약속 id',
        required: true,
        type: 'integer',
    }
    #swagger.requestBody = {
        in: 'body',
        description: '수정할 일정 정보',
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/patchGroupsIdPlansIdSchedulesReq" },
            }
        }
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/patchGroupsIdPlansIdSchedulesRes200" }
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
        const check = await checkSchedule(req.query.plan_id, req.body.submission_time_slot);

        if (!check.result) {
            req.result = {
                error: {
                    statusCode: check.statusCode,
                    comment: check.comment
                }
            };
        } else {
            await updateSchedule(req.user.id, req.query.plan_id, req.body.submission_time_slot)
            .then(async (info) => {
                if (info.statusCode !== 200) {
                    req.result = {
                        error: {
                            statusCode: info.statusCode,
                            comment: info.comment
                        }
                    };
                } else {
                    await deletePlanSchedule(req.user.id, req.query.plan_id)
                    .then(async (info) => {
                        if (info.statusCode !== 200) {
                            req.result = {
                                error: {
                                    statusCode: info.statusCode,
                                    comment: info.comment
                                }
                            };
                        } else {
                            await updatePlanSchedule(req.user.id, req.query.plan_id, req.body.submission_time_slot)
                            .then(async (info) => {
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
                                        plan: info.plan,
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
    };

    next();
}, handleError);


router.get('/:group_id/plans/:plan_id/schedule', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id/plans/:plan_id/schedule'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '개별 일정 확인 API (인증 필요)'
    #swagger.description = '자신이 제출한 일정을 확인하기 위한 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '약속이 속한 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.parameters['plan_id'] = {
        in: 'query',
        description: '제출된 일정을 확인할 약속 id',
        required: true,
        type: 'integer',
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getGroupsIdPlansIdScheduleRes200" }
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
        await searchSchedule(req.user.id, req.query.plan_id)
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
                    submission: info.submission,
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


router.get('/:group_id/plans/:plan_id/candidates', isLoggedIn, isNotNewUser, isGroupUser, async (req, res, next) => {
    /* 
    #swagger.path = '/groups/:group_id/plans/:plan_id/candidates'
    #swagger.tags = ['GroupRouter']
    #swagger.summary = '일정 후보 계산 API (인증 필요)'
    #swagger.description = '일정 후보를 게산하기 위한 엔드포인트'
    #swagger.parameters['group_id'] = {
        in: 'query',
        description: '약속이 속한 그룹 id',
        required: true,
        type: 'integer',
    }
    #swagger.parameters['plan_id'] = {
        in: 'query',
        description: '일정 후보를 계산할 약속 id',
        required: true,
        type: 'integer',
    }
    #swagger.responses[200] = {
        content: {
            "application/json": {
                schema:{ $ref: "#/components/schemas/getGroupsIdPlansIdCandidatesRes200" }
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
        await calculateCandidates(req.query.plan_id)
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
                    candidate_plan_time: info.candidate_plan_time,
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



module.exports = router;
