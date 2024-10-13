const swaggerAutogen = require("swagger-autogen")({openapi: '3.0.0'});
const path = require("path");

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
        {
            name: 'PlanRouter',
            description: '약속 상태를 업데이트하는 라우터'
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
                $invitationCode: 'invitation_code',
                $preference_setting: 'manual',
                $manual_group_preference: {
                    day: [5, 6],
                    time: [1, 2],
                }
            },
            postGroupsIdPlansReq: {     // '생성할 약속 정보'
                $name: 'myPlan',
                $date_list: ["2024-11-01", "2024-11-03"],
                $time_scope: {
                    "start": "09:00",
                    "end": "10:00"
                },
                $minimum_user_count: 2,
                $maximum_user_count: 2,
                $progress_time: 30,
                $schedule_deadline: '2024-11-05 00:00',
            },
            patchGroupsIdPlansIdReq: {     // '수정할 약속 정보'
                $name: 'testPlan',
                $minimum_user_count: 2,
                $maximum_user_count: 3,
                $progress_time: 60,
                $schedule_deadline: '2024-11-06 00:00',
            },
            postGroupsIdPlansIdSchedulesReq: {      // '제출할 일정 정보'
                $submission_time_slot: [
                    {
                        "date": "2024-11-01",
                        "time_scope": [
                            {
                                "start": "9:00",
                                "end": "9:15",
                                "available": true
                            }
                        ]
                    }
                ]
            },
            patchGroupsIdPlansIdSchedulesReq: {      // '수정할 일정 정보'
                $submission_time_slot: [
                    {
                        "date": "2024-11-03",
                        "time_scope": [
                            {
                                "start": "9:00",
                                "end": "9:15",
                                "available": true
                            }
                        ]
                    }
                ]
            },
            postGroupsIdPlansIdSelectionReq: {      // '선택할 일정 정보'
                $plan_time: {
                    "start": "9:00",
                    "end": "9:30",
                    "day": 0,
                    "time": 0
                }
            },
            postGroupsIdPlansIdFailureReq: {      // '처리할 약속 정보'
                $option: "select or cancel or reset",
                // select
                $vote_plan_time: [
                    {
                        start: '시작일',
                        end: '종료일'
                    }
                ],
                $vote_deadline: "투표 제출 마감일"
            },
            postGroupsIdPlansIdVotesReq: {      // '제출할 투표 정보'
                $vote_plan_time: [
                    {
                        start: '시작일',
                        end: '종료일',
                        day: '요일',
                        time: '아침, 낮, 저녁',
                        approval: true
                    }
                ]
            },
            patchGroupsIdPlansIdVotesReq: {      // '수정할 투표 정보'
                $vote_plan_time: [
                    {
                        start: '시작일',
                        end: '종료일',
                        day: '요일',
                        time: '아침, 낮, 저녁',
                        approval: false
                    }
                ]
            },
            
            // 공용 응답
            response_303: {     // '요청을 다른 페이지로 연결'
                $message: "리다이렉트가 필요한 요청입니다.",
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
                    name: '사용자 이름',
                    email: '사용자 이메일',
                    provider: '로그인 종류',
                    calendar_id: '기본 캘린더 id',
                },
                $preference: {
                    day_preference: '요일 선호도 정보',
                    time_preference: '시간 선호도 정보',
                },
            },
            postUsersRes201: {  // 'POST /users 요청 성공'
                $statusCode: '201',
            },
            getUsersLoginCallbackRes200: {  // 'GET /users/login 요청 성공'
                $statusCode: '200',
                $user: {
                    name: '사용자 이름',
                },
            },
            getUsersLoginCallbackRes201: {  // 'GET /users/login 요청 성공'
                $statusCode: '201',
                $user: {
                    name: '사용자 이름',
                },
            },
            postUsersLoginRes200: {     // 'POST /users/login 요청 성공'
                $statusCode: '200',
                $user: {
                    name: '사용자 이름',
                },
            },
            postUsersLogoutRes200: {    // 'POST /users/logout 요청 성공'
                $statusCode: '200',
                $message: '로그아웃에 성공했습니다.',
            },
            getUsersPreferencesRes200: {  // 'GET /users/preferences 요청 성공'
                $statusCode: '200',
                $preference: {
                    day_preference: '요일 선호도 정보',
                    time_preference: '시간 선호도 정보',
                },
            },
            postUsersPreferencesRes201: {  // 'POST /users/preferences 요청 성공'
                $statusCode: '201',
                $preference: {
                    day_preference: '요일 선호도 정보',
                    time_preference: '시간 선호도 정보',
                },
            },
            getUsersPlansRes200: {  // 'GET /users/plans 요청 성공'
                $statusCode: '200',
                $plans: [
                    {
                        id: '약속 id',
                        name: '약속 이름',
                        group: '약속이 생성된 그룹 id',
                        plan_time: '확정된 약속 시간',
                        candidate_plan_time: '계산된 일정 후보 목록',
                        vote_plan_time: '투표할 일정 후보 목록',
                        plan_time_slot: '일정 제출 양식',
                        minimum_user_count: '제출된 시간대에서 겹칠 수 있는 최소 인원수',
                        maximum_user_count: '일정을 제출할 최대 인원 수',
                        progress_time: '약속 진행 시간',
                        schedule_deadline: '일정 제출 마감일',
                        status: '약속 진행 상태',
                        created_at: '약속 생성일',
                        updated_at: '약속 정보 수정일',
                    }
                ]
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
                    preference_setting: '일정 후보 자동 선택 시 사용할 선호도 방식',
                    manual_group_preferenece: '그룹 선호도 정보(수동)',
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
                        preference_setting: '일정 후보 자동 선택 시 사용할 선호도 방식',
                        manual_group_preferenece: '그룹 선호도 정보(수동)',
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
            getGroupsIdPreferencesRes200: {      // 'GET /groups/{group_id}/preferences 요청 성공'
                $statusCode: '200',
                $auto_group_preference: {
                    day: '그룹 요일 선호도 중 최댓값을 가지는 선호도들',
                    time: '그룹 시간 선호도 중 최댓값을 가지는 선호도들'
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
                    preference_setting: '일정 후보 자동 선택 시 사용할 선호도 방식',
                    manual_group_preferenece: '그룹 선호도 정보(수동)',
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
                    preference_setting: '일정 후보 자동 선택 시 사용할 선호도 방식',
                    manual_group_preferenece: '그룹 선호도 정보(수동)',
                    creator: '그룹 생성자',
                    created_at: '그룹 생성일',
                    updated_at: '그룹 정보 수정일',
                }
            },
            postGroupsIdPlansRes201: {      // 'POST /groups/{group_id}/plans 요청 성공'
                $statusCode: '201',
                $plan: {
                    id: '약속 id',
                    name: '약속 이름',
                    group: '약속이 생성된 그룹 id',
                    plan_time: '확정된 약속 시간',
                    candidate_plan_time: '계산된 일정 후보 목록',
                    vote_plan_time: '투표할 일정 후보 목록',
                    plan_time_slot: '일정 제출 양식',
                    minimum_user_count: '제출된 시간대에서 겹칠 수 있는 최소 인원수',
                    maximum_user_count: '일정을 제출할 최대 인원 수',
                    progress_time: '약속 진행 시간',
                    schedule_deadline: '일정 제출 마감일',
                    status: '약속 진행 상태',
                    created_at: '약속 생성일',
                    updated_at: '약속 정보 수정일',
                }
            },
            getGroupsIdPlansRes200: {       // 'GET /groups/{group_id}/plans 요청 성공'
                $statusCode: '200',
                $plans: [
                    {
                        id: '약속 id',
                        name: '약속 이름',
                        group: '약속이 생성된 그룹 id',
                        plan_time: '확정된 약속 시간',
                        candidate_plan_time: '계산된 일정 후보 목록',
                        vote_plan_time: '투표할 일정 후보 목록',
                        plan_time_slot: '일정 제출 양식',
                        minimum_user_count: '제출된 시간대에서 겹칠 수 있는 최소 인원수',
                        maximum_user_count: '일정을 제출할 최대 인원 수',
                        progress_time: '약속 진행 시간',
                        schedule_deadline: '일정 제출 마감일',
                        status: '약속 진행 상태',
                        created_at: '약속 생성일',
                        updated_at: '약속 정보 수정일',
                    }
                ]
            },
            patchGroupsIdPlansIdRes200: {       // 'PATCH /groups/{group_id}/plans/{plan_id} 요청 성공'
                $statusCode: '200',
                $plan: {
                    id: '약속 id',
                    name: '약속 이름',
                    group: '약속이 생성된 그룹 id',
                    plan_time: '확정된 약속 시간',
                    candidate_plan_time: '계산된 일정 후보 목록',
                    vote_plan_time: '투표할 일정 후보 목록',
                    plan_time_slot: '일정 제출 양식',
                    minimum_user_count: '제출된 시간대에서 겹칠 수 있는 최소 인원수',
                    maximum_user_count: '일정을 제출할 최대 인원 수',
                    progress_time: '약속 진행 시간',
                    schedule_deadline: '일정 제출 마감일',
                    status: '약속 진행 상태',
                    created_at: '약속 생성일',
                    updated_at: '약속 정보 수정일',
                }
            },
            getGroupsIdPlansIdRes200: {       // 'GET /groups/{group_id}/plans/{plan_id} 요청 성공'
                $statusCode: '200',
                $plan: {
                    id: '약속 id',
                    name: '약속 이름',
                    group: '약속이 생성된 그룹 id',
                    plan_time: '확정된 약속 시간',
                    candidate_plan_time: '계산된 일정 후보 목록',
                    vote_plan_time: '투표할 일정 후보 목록',
                    plan_time_slot: '일정 제출 양식',
                    minimum_user_count: '제출된 시간대에서 겹칠 수 있는 최소 인원수',
                    maximum_user_count: '일정을 제출할 최대 인원 수',
                    progress_time: '약속 진행 시간',
                    schedule_deadline: '일정 제출 마감일',
                    status: '약속 진행 상태',
                    created_at: '약속 생성일',
                    updated_at: '약속 정보 수정일',
                }
            },
            postGroupsIdPlansIdSchedulesRes201: {       // 'POST /groups/{group_id}/plans/{plan_id}/schedules 요청 성공'
                $statusCode: '201',
                $plan: {
                    id: '약속 id',
                    name: '약속 이름',
                    group: '약속이 생성된 그룹 id',
                    plan_time: '확정된 약속 시간',
                    candidate_plan_time: '계산된 일정 후보 목록',
                    vote_plan_time: '투표할 일정 후보 목록',
                    plan_time_slot: '일정 제출 양식',
                    minimum_user_count: '제출된 시간대에서 겹칠 수 있는 최소 인원수',
                    maximum_user_count: '일정을 제출할 최대 인원 수',
                    progress_time: '약속 진행 시간',
                    schedule_deadline: '일정 제출 마감일',
                    status: '약속 진행 상태',
                    created_at: '약속 생성일',
                    updated_at: '약속 정보 수정일',
                }
            },
            getGroupsIdPlansIdSchedulesRes200: {       // 'GET /groups/{group_id}/plans/{plan_id}/schedules 요청 성공'
                $statusCode: '200',
                $submissions: [
                    {
                        id: '제출한 일정 id',
                        user_id: '일정을 제출한 사용자 id',
                        plan_id: '일정이 제출된 약속 id',
                        submission_time_slot: '제출한 일정 정보',
                        created_at: '일정 제출일',
                        updated_at: '일정 수정일',
                    }
                ]
            },
            getGroupsIdPlansIdScheduleRes200: {       // 'GET /groups/{group_id}/plans/{plan_id}/schedule 요청 성공'
                $statusCode: '200',
                $submission: {
                    id: '제출한 일정 id',
                    user_id: '일정을 제출한 사용자 id',
                    plan_id: '일정이 제출된 약속 id',
                    submission_time_slot: '제출한 일정 정보',
                    created_at: '일정 제출일',
                    updated_at: '일정 수정일',
                }
            },
            patchGroupsIdPlansIdSchedulesRes200: {       // 'PATCH /groups/{group_id}/plans/{plan_id}/schedule 요청 성공'
                $statusCode: '200',
                $submission: {
                    id: '제출한 일정 id',
                    user_id: '일정을 제출한 사용자 id',
                    plan_id: '일정이 제출된 약속 id',
                    submission_time_slot: '제출한 일정 정보',
                    created_at: '일정 제출일',
                    updated_at: '일정 수정일',
                }
            },
            getPlansRes200: {       // 'GET /plans 요청 성공'
                $statusCode: '200',
            },
            getGroupsIdPlansIdCandidatesRes200: {       // 'GET /groups/{group_id}/plans/{plan_id}/candidates 요청 성공'
                $statusCode: '200',
                $candidate_plan_time: [
                    {
                        start: '시작일',
                        end: '종료일',
                        day: '요일',
                        time: '아침, 낮, 저녁'
                    }
                ]
            },
            getGroupsIdPlansIdSelectionRes200: {       // 'GET /groups/{group_id}/plans/{plan_id}/selection 요청 성공'
                $statusCode: '200',
                $plan_time: [
                    {
                        start: '시작일',
                        end: '종료일',
                        day: '요일',
                        time: '아침, 낮, 저녁'
                    }
                ]
            },
            postGroupsIdPlansIdSelectionRes200: {       // 'POST /groups/{group_id}/plans/{plan_id}/selection 요청 성공'
                $statusCode: '200',
                $plan_time: [
                    {
                        start: '시작일',
                        end: '종료일',
                        day: '요일',
                        time: '아침, 낮, 저녁'
                    }
                ]
            },
            postGroupsIdPlansIdFailureRes200: {       // 'POST /groups/{group_id}/plans/{plan_id}/failure 요청 성공'
                $statusCode: '200',
                $plan: {
                    id: '약속 id',
                    name: '약속 이름',
                    group: '약속이 생성된 그룹 id',
                    plan_time: '확정된 약속 시간',
                    candidate_plan_time: '계산된 일정 후보 목록',
                    vote_plan_time: '투표할 일정 후보 목록',
                    plan_time_slot: '일정 제출 양식',
                    minimum_user_count: '제출된 시간대에서 겹칠 수 있는 최소 인원수',
                    maximum_user_count: '일정을 제출할 최대 인원 수',
                    progress_time: '약속 진행 시간',
                    schedule_deadline: '일정 제출 마감일',
                    status: '약속 진행 상태',
                    created_at: '약속 생성일',
                    updated_at: '약속 정보 수정일',
                }
            },
            postGroupsIdPlansIdVotesRes200: {       // 'POST /groups/{group_id}/plans/{plan_id}/votes 요청 성공'
                $statusCode: '200',
                $plan: {
                    id: '약속 id',
                    name: '약속 이름',
                    group: '약속이 생성된 그룹 id',
                    plan_time: '확정된 약속 시간',
                    candidate_plan_time: '계산된 일정 후보 목록',
                    vote_plan_time: '투표할 일정 후보 목록',
                    plan_time_slot: '일정 제출 양식',
                    minimum_user_count: '제출된 시간대에서 겹칠 수 있는 최소 인원수',
                    maximum_user_count: '일정을 제출할 최대 인원 수',
                    progress_time: '약속 진행 시간',
                    schedule_deadline: '일정 제출 마감일',
                    status: '약속 진행 상태',
                    created_at: '약속 생성일',
                    updated_at: '약속 정보 수정일',
                }
            },
            patchGroupsIdPlansIdVotesRes200: {       // 'PATCH /groups/{group_id}/plans/{plan_id}/votes 요청 성공'
                $statusCode: '200',
                $plan: {
                    id: '약속 id',
                    name: '약속 이름',
                    group: '약속이 생성된 그룹 id',
                    plan_time: '확정된 약속 시간',
                    candidate_plan_time: '계산된 일정 후보 목록',
                    vote_plan_time: '투표할 일정 후보 목록',
                    plan_time_slot: '일정 제출 양식',
                    minimum_user_count: '제출된 시간대에서 겹칠 수 있는 최소 인원수',
                    maximum_user_count: '일정을 제출할 최대 인원 수',
                    progress_time: '약속 진행 시간',
                    schedule_deadline: '일정 제출 마감일',
                    status: '약속 진행 상태',
                    created_at: '약속 생성일',
                    updated_at: '약속 정보 수정일',
                }
            },
            getGroupsIdPlansIdVotesRes200: {       // 'GET /groups/{group_id}/plans/{plan_id}/votes 요청 성공'
                $statusCode: '200',
                $votes: [
                    {
                        id: '제출한 투표 id',
                        user_id: '투표를 제출한 사용자 id',
                        plan_id: '투표가 제출된 약속 id',
                        submission_time_slot: '제출한 투표 정보',
                        created_at: '투표 제출일',
                        updated_at: '투표 수정일',
                    }
                ]
            },
            getGroupsIdPlansIdVoteRes200: {       // 'GET /groups/{group_id}/plans/{plan_id}/vote 요청 성공'
                $statusCode: '200',
                $vote: {
                    id: '제출한 투표 id',
                    user_id: '투표를 제출한 사용자 id',
                    plan_id: '투표가 제출된 약속 id',
                    submission_time_slot: '제출한 투표 정보',
                    created_at: '투표 제출일',
                    updated_at: '투표 수정일',
                }
            },
            getUsersCalendarsRes200: {       // 'GET /users/calendars 요청 성공'
                $statusCode: '200',
                $calendarList: [
                    {   
                        id: '캘린더 id',
                        summary: '캘린더 제목',
                        description: '캘린더에 대한 설명'
                    }
                ]
            },
            getUsersCalendarsFreebusyRes200: {       // 'GET /users/calendars/freebusy 요청 성공'
                $statusCode: '200',
                $submission_time_slot: [
                    {
                        "date": "2024-11-01",
                        "time_scope": [
                            {
                                "start": "9:00",
                                "end": "9:15",
                                "available": true
                            }
                        ]
                    }
                ]
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
