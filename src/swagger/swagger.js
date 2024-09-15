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
            postUsers: {    // '회원가입 시 필요한 정보'
                $name: '홍승빈',
                $email: 'libeyang01@naver.com',
                $password: '12345678',
            },
            postUsersLogin: {   // '로그인 시 필요한 정보'
                $email: 'libeyang01@naver.com',
                $password: '12345678',
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
                $preference: {
                    id: '선호도 id',
                    user_id: '사용자 이름',
                    day_preference: '요일 선호도 정보',
                    time_preference: '시간 선호도 정보',
                    created_at: '선호도 생성일',
                    updated_at: '선호도 정보 수정일',
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
                $passport: {
                    id: '사용자 id',
                },
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
            postUsersLoginRes200: {
                $statusCode: '200',
                $passport: {
                    id: '사용자 id',
                },
            },
            postUsersLogoutRes200: {    // 'POST /users/logout 요청 성공'
                $statusCode: '200',
                $message: '로그아웃에 성공했습니다.',
            },
            

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
