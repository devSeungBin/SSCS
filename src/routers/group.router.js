const express = require('express');
const { join } = require('path');

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
    searchParticipant
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
        let newGroup = {
            name: req.body.name,
            creator: req.user.id,
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
        const { name, invitationCode } = req.body;

        let group = {};
        let formError = false;

        if (!req.query.group_id) {
            formError = true;
        } else {
            group.id = req.query.group_id;
        };
        if (name) { group.name = name; };
        if (invitationCode) { group.invitation_code = invitationCode; };

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
                        statusCode: 500,
                        comment: err
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

router.post('/members', isLoggedIn, isNotNewUser, isNotGroupUser, async (req, res, next) => {
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





module.exports = router;
