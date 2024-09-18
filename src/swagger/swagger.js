const swaggerAutogen = require("swagger-autogen")({openapi: '3.0.0'});
const path = require("path");
const { response } = require("express");

// API 문서 자동화

const doc = {
    info: {
        version: '1.0.0',
        title: 'Plans Wizard\'s REST API',
        description: 'Plans Wizard\'s API 명세서'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Plans Wizard\'s API 명세서 주소'
        },
    ],
    tags: [
        {
            name: 'UserRouter',
            description: '사용자와 관련된 기능을 처리하는 라우터'
        },
        {
            name: 'GroupRouter',
            description: '그룹과 관련된 기능을 처리하는 라우터'
        },
    ],
    components: {
        schemas: {
            // 사설 요청
            postUsersReq: {    // '회원가입 시 필요한 정보'
                $name: '홍승빈',
                $email: 'libeyang01@naver.com',
                $password: '12345678',
            },
            postUsersLoginReq: {   // '로그인 시 필요한 정보'
                $email: 'libeyang01@naver.com',
                $password: '12345678',
            },
            postUsersPreferenceReq: {   // '신규 로그인 시 필요한 선호도 정보'
                $day_preference: {
                    Mon: 3,
                    Tue: 3,
                    Wed: 3,
                    Thu: 3,
                    Fri: 3,
                    Sat: 3,
                    Sun: 3,
                },
                $time_preference: {
                    morning: 3,
                    afternoon: 3,
                    evening: 3,
                },
            },
            patchUsersReq: {   // '수정할 사용자 프로필, 선호도 정보'
                $user: {
                    name: '박민혁'
                },
                $preference: {
                    day_preference: {
                        Mon: 5,
                        Tue: 5,
                        Wed: 5,
                        Thu: 5,
                        Fri: 5,
                        Sat: 5,
                        Sun: 5,
                    },
                    time_preference: {
                        morning: 1,
                        afternoon: 1,
                        evening: 1,
                    },
                }
            },
            postGroupsReq: {   // '생성할 그룹 정보'
                $name: 'myGroup'
            },
            postGroupsMembersReq: {    // '참여할 그룹 초대코드'
                $invitationCode: 'invitation_code'
            },
            patchGroupsIdReq: {     // '수정할 그룹 정보'
                $name: 'testGroup',
                $invitationCode: 'invitation_code'
            },
            
            // 공용 응답
            response_303: {     // '요청을 다른 페이지로 연결'
                $location: "리다이렉트 URL",
            },
            response_400: {     // '클라이언트 요청 실패 (잘못된 요청 구문)'
                $statusCode: '400',
                $message: '해당 요청이 올바르지 않습니다.',
                $comment: '(자세한 오류 내용)',
            },
            response_401: {     // '클라이언트 요청 실패 (사용자 인증 필요)'
                $statusCode: '401',
                $message: '로그인이 필요한 기능입니다.',
            },
            response_403: {     // '클라이언트 요청 실패 (사용자 권한 필요)'
                $statusCode: '403',
                $message: '권한이 필요한 기능입니다.',
            },
            response_404: {     // 'GET /users 요청 성공 (DB 자원 검색 실패)'
                $statusCode: '404',
                $message: '요청된 자원이 서버에 존재하지 않습니다.',
                $comment: '(자세한 오류 내용)',
            },
            response_409: {     // '클라이언트 요청 실패 (중복된 자원)'
                $statusCode: '409',
                $message: '요청된 자원이 이미 서버에 존재합니다.',
                $comment: '(자세한 오류 내용)',
            },
            response_500: {     // '서버 응답 실패 (요청 이행 불가)'
                $statusCode: '500',
                $message: '서버에서 오류가 발생했습니다.',
                $comment: '(자세한 오류 내용)',
            },

            // 사설 응답
            getUsersRes200: {   // 'GET /users 요청 성공'
                $statusCode: '200',
                $user: {
                    id: '사용자 id',
                    name: '사용자 이름',
                    email: '사용자 이메일',
                    password: '사용자 비밀번호',
                    image: '사용자 프로필 이미지',
                    provider: '로그인 종류',
                    new: '신규 사용자 여부',
                    created_at: '사용자 가입일',
                    updated_at: '사용자 정보 수정일',
                },
                $preference: {
                    id: '선호도 id',
                    user_id: '사용자 이름',
                    day_preference: '요일 선호도 정보',
                    time_preference: '시간 선호도 정보',
                    created_at: '선호도 생성일',
                    updated_at: '선호도 정보 수정일',
                },
            },
            postUsersRes201: {  // 'POST /users 요청 성공'
                $statusCode: '201',
                $user: {
                    id: '사용자 id',
                    name: '사용자 이름',
                    email: '사용자 이메일',
                    password: '사용자 비밀번호',
                    image: '사용자 프로필 이미지',
                    provider: '로그인 종류',
                    new: '신규 사용자 여부',
                    created_at: '사용자 가입일',
                    updated_at: '사용자 정보 수정일',
                },
            },
            getUsersLoginCallbackRes200: {  // 'GET /users/login 요청 성공'
                $statusCode: '200',
                $passport: {
                    id: '사용자 id',
                },
            },
            getUsersLoginCallbackRes201: {  // 'GET /users/login 요청 성공'
                $statusCode: '201',
                $user: {
                    id: '사용자 id',
                    name: '사용자 이름',
                    email: '사용자 이메일',
                    password: '사용자 비밀번호',
                    image: '사용자 프로필 이미지',
                    provider: '로그인 종류',
                    new: '신규 사용자 여부',
                    created_at: '사용자 가입일',
                    updated_at: '사용자 정보 수정일',
                },
                $passport: {
                    id: '사용자 id',
                },
            },
            postUsersLoginRes200: {     // 'POST /users/login 요청 성공'
                $statusCode: '200',
                $passport: {
                    id: '사용자 id',
                },
            },
            postUsersLogoutRes200: {    // 'POST /users/logout 요청 성공'
                $statusCode: '200',
                $message: '로그아웃에 성공했습니다.',
            },
            getUsersPreferencesRes200: {  // 'GET /users/preferences 요청 성공'
                $statusCode: '200',
                $preference: {
                    id: '선호도 id',
                    user_id: '사용자 이름',
                    day_preference: '요일 선호도 정보',
                    time_preference: '시간 선호도 정보',
                    created_at: '선호도 생성일',
                    updated_at: '선호도 정보 수정일',
                },
            },
            postUsersPreferencesRes201: {  // 'POST /users/preferences 요청 성공'
                $statusCode: '201',
                $preference: {
                    id: '선호도 id',
                    user_id: '사용자 이름',
                    day_preference: '요일 선호도 정보',
                    time_preference: '시간 선호도 정보',
                    created_at: '선호도 생성일',
                    updated_at: '선호도 정보 수정일',
                },
            },
            patchUsersRes200: {   // 'PATCH /users 요청 성공'
                $statusCode: '200',
                $user: {
                    name: '박민혁'
                },
                $preference: {
                    day_preference: {
                        Mon: 5,
                        Tue: 5,
                        Wed: 5,
                        Thu: 5,
                        Fri: 5,
                        Sat: 5,
                        Sun: 5,
                    },
                    time_preference: {
                        morning: 1,
                        afternoon: 1,
                        evening: 1,
                    },
                }
            },
            postGroupsRes201: {   // 'POST /groups 요청 성공'
                $statusCode: '201',
                $group: {
                    id: '그룹 id',
                    name: '그룹 이름',
                    image: '그룹 프로필 이미지',
                    user_count: '그룹 참여자 수',
                    invitation_code: '그룹 초대코드',
                    creator: '그룹 생성자',
                    created_at: '그룹 생성일',
                    updated_at: '그룹 정보 수정일',
                }
            },
            getGroupsRes200: {   // 'GET /groups 요청 성공'
                $statusCode: '200',
                $groups: [
                    {
                        id: '그룹 id',
                        name: '그룹 이름',
                        image: '그룹 프로필 이미지',
                        user_count: '그룹 참여자 수',
                        invitation_code: '그룹 초대코드',
                        creator: '그룹 생성자',
                        created_at: '그룹 생성일',
                        updated_at: '그룹 정보 수정일',
                    }
                ]
            },
            getGroupsIdMembersRes200: {     // 'GET /groups/{group_id}/members 요청 성공'
                $statusCode: '200',
                $participants: [
                    {
                        id: '사용자 id',
                        name: '사용자 이름',
                        email: '사용자 이메일',
                        password: '사용자 비밀번호',
                        image: '사용자 프로필 이미지',
                        provider: '로그인 종류',
                        new: '신규 사용자 여부',
                        created_at: '사용자 가입일',
                        updated_at: '사용자 정보 수정일',
                    }
                ]
            },
            getGroupsIdInviteRes200: {      // 'GET /groups/{group_id}/invite 요청 성공'
                $statusCode: '200',
                $invitationCode: '초대코드'
            },
            postGroupsMembers201: {      // 'POST /groups/{group_id}/invite 요청 성공'
                $statusCode: '201',
                $participant: {
                    id: '참여정보 id',
                    user_id: '사용자 id',
                    group_id: '참여한 그룹 id',
                    created_at: '그룹 참여일',
                    updated_at: '그룹 참여 수정일',
                }
            },
            patchGroupsIdRes200: {      // 'PATCH /groups/{group_id} 요청 성공'
                $statusCode: '200',
                $group: {
                    id: '그룹 id',
                    name: '그룹 이름',
                    image: '그룹 프로필 이미지',
                    user_count: '그룹 참여자 수',
                    invitation_code: '그룹 초대코드',
                    creator: '그룹 생성자',
                    created_at: '그룹 생성일',
                    updated_at: '그룹 정보 수정일',
                }
            },
            getGroupsIdRes200: {    // 'GET /groups/{group_id} 요청 성공'
                $statusCode: '200',
                $group: {
                    id: '그룹 id',
                    name: '그룹 이름',
                    image: '그룹 프로필 이미지',
                    user_count: '그룹 참여자 수',
                    invitation_code: '그룹 초대코드',
                    creator: '그룹 생성자',
                    created_at: '그룹 생성일',
                    updated_at: '그룹 정보 수정일',
                }
            }
            

        },
    },
    securityDefinitions: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            in: 'header',
            bearerFormat: 'JWT'
        }
    },
};


const outputFile = path.join(__dirname, '../swagger.json');
const endpointFiles = [path.join(__dirname, '../routers/*.js')];

swaggerAutogen(outputFile, endpointFiles, doc);
