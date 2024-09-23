# 벡엔드 목표 리스트 

**0. 기초 서버 구성**  
- Javascript + Express 기반 서버 구축 [완료]
- 임시 API 구현 및 테스트 [완료]
- API 문서 자동화 구현 및 테스트 [완료]
- PostgreSQL 기반 DB 구축 [완료]
    - 필요한 DB 스키마 설계 [완료]
    - 서버와 DB 연동 [완료]

이후는 목표 동작 시나리오대로 기능을 구현

***

**1. 그룹 참여 단계**

메인 페이지에서 회원가입 이후 로컬 또는 구글 로그인을 진행한다.  
첫 로그인 시 사용자 일정 선호도를 먼저 입력한 후 사용자 홈 페이지로 이동한다.  
사용자 홈 페이지에서 새 그룹을 생성하거나 다른 그룹에 참여한다.

(사용자 설정 페이지에서 사용자 개인 정보 또는 일정 선호도를 변경한다.)  
(사용자 대시보드 페이지에서 참여한 그룹의 약속 목록들을 확인한다.)

```
> 필요한 API - 기능

> GET /users - 사용자 정보 조회 [완성, 응답 테스트 완료]
> POST /users - 로컬 회원가입 [완성, 응답 테스트 완료]
> PATCH /users - 사용자 정보 수정 [완성, 응답 테스트 완료]
> DELETE /users - 사용자 탈퇴

> GET /users/login - 구글 로그인 [완성, 응답 테스트 완료]
> GET /users/login/callback - 리다이렉트 [완성, 응답 테스트 완료]
> POST /users/login - 로컬 로그인 [완성, 응답 테스트 완료]

> POST /users/logout - 사용자 로그아웃 [완성, 응답 테스트 완료]

> GET /users/preferences - 사용자 선호도 정보 조회 [완성, 응답 테스트 완료]
> POST /users/preferences - 사용자 선호도 정보 생성 [완성, 응답 테스트 완료]

> GET /users/plans - 사용자 개인 약속 조회 [완성, 응답 테스트 완료]

> POST /groups - 새 그룹 생성 [완성, 응답 테스트 완료]
```

***

**2. 약속 생성 단계**

사용자 홈 페이지에서 자신이 참여한 그룹 목록을 확인한다.  
그룹 페이지에서 해당 그룹에 참여한 그룹 참여자 목록과 **특정 날짜**의 약속 목록을 확인인다.  
그룹 페이지에서 새로운 약속을 생성한다.  

(**특정 날짜**는 그룹 페이지 중앙에 위치한 그룹 캘린더에서 선택한다.)  
(그룹 생성자는 그룹의 이름 또는 그룹 초대코드를 수정할 수 있다.)

> **약속의 상태**  
> 약속은 총 4가지 상태로 구분된다.  
> 1. 일정 모집 (submit)  
> 약속이 새로 생성되었을 때, 해당 상태값을 지난다.  
>
> 2. 일정 계산 (calculate)  
> 모든 일정이 모집되거나 마감일이 지났을 때, 해당 상태값을 지닌다.
>
> 3. 일정 선택 (select)  
> 일정 후보가 모두 계산되었을 때, 해당 상태값을 지닌다.  
> 
> 4. 약속 확정 (comfirm)  
> 일정 선택이 끝났을 때, 해당 상태값을 지닌다.


```
> 필요한 API - 기능

> GET /groups - 모든 그룹 정보 조회(사용자가 참여한) [완성, 응답 테스트 완료]

> GET /groups/{group_id} - 단일 그룹 정보 조회 [완성, 응답 테스트 완료]
> PATCH /groups/{group_id} - 그룹 정보 수정 [완성, 응답 테스트 완료]
> DELETE /groups/{group_id} - 그룹 삭제

> GET /groups/{group_id}/members - 그룹 참여자 정보 조회 [완성, 응답 테스트 완료]
> POST /groups/members - 그룹 참여자 생성(그룹 참여) [완성, 응답 테스트 완료]
> DELETE /groups/{group_id}/members - 그룹 탈퇴

> GET /groups/{group_id}/invite - 그룹 참여코드 조회(코드 재생성) [완성, 응답 테스트 완료]

> GET /groups/{group_id}/plans - 그룹 약속 목록 조회 [완성, 응답 테스트 완료]
> POST /groups/{group_id}/plans - 그룹 약속 생성 [완성, 응답 테스트 완료]

> GET /groups/{group_id}/plans/{plan_id} - 약속 정보 조회 [완성, 응답 테스트 완료]
> PATCH /groups/{group_id}/plans/{plan_id} - 그룹 약속 수정 (유저 수정) [완성, 응답 테스트 완료]
> DELETE /groups/{group_id}/plans/{plan_id} - 그룹 약속 삭제
```

***

**3. 일정 후보 계산 단계**

*일정 후보 계산을 시작하면, 제출된 참여자들의 일정들이 겹치는 시간대를 계산한다. 이때 겹치는 시간대를 계산하는 이유는 제출할 일정 입력 시 사용자가 가능한 시간대를 입력받기 때문이다.*

그룹 참여자는 약속에 지정된 날짜 범위 내에서 자신의 일정을 마감일까지 제출한다.  
모든 참여자가 일정을 제출했거나 마감일이 지나면, 일정 제출이 마감되고 제출된 일정을 바탕으로 시간대가 겹치는 부분인 일정 후보를 계산한다.  
만약 약속 조건에 부합하는 일정 후보가 계산되지 않는 경우, **네 가지 옵션**이 제공된다.  

(사용자는 직접 일정을 입력하거나, 구글 캘린더에서 일정 정보를 가져와 입력한다.)  
(참여자는 일정 후보가 계산되기 전까지 자신이 제출한 일정 정보를 수정할 수 있다.)  

> **네 가지 옵션**  
> 1. 그룹 생성자는 약속 조건을 수정한 후 일정 후보를 다시 계산한다.  
> 2. 일정 후보 계산을 건너뛰고 그룹 생성자가 바로 일정을 선택한다.  
> 3. 일정 후보 계산을 건너뛰고 그룹 참여자들의 투표로 바로 일정을 선택한다.  
> 4. 약속 생성을 취소한다. 

```
> 필요한 API - 기능

> GET /groups/{group_id}/plans/{plan_id}/schedules - 제출된 모든 일정 확인 [완성, 응답 테스트 완료]
> POST /groups/{group_id}/plans/{plan_id}/schedules - 일정 제출 [완성, 응답 테스트 완료]
> PATCH /groups/{group_id}/plans/{plan_id}/schedules - 개별 일정 수정 [완성, 응답 테스트 완료]
> DELETE /groups/{group_id}/plans/{plan_id}/schedules - 제출한 일정 삭제

> GET /groups/{group_id}/plans/{plan_id}/schedule - 개별 일정 확인 [완성, 응답 테스트 완료]

> GET ?? - 구글 캘린더 일정 가져오기 (구글 연동 필요)
```

***

**4. 일정 후보 선택 단계**

일정 후보가 계산되면, 그룹 생성자는 해당 후보 중에서 약속 일정을 선택한다.  
약속 일정 선택 시 **두 가지 옵션**을 제공한다.  
위에서 고른 옵션을 통해 그룹 생성자가 일정을 선택하면 약속이 확정된다.  

> **두 가지 옵션**  
> 1. 그룹의 일정 선호도를 기반으로 자동으로 추천된 일정을 선택한다.
> 2. 그룹 내 투표나 관리자가 수동으로 일정을 선택한다.

```
> 필요한 API - 기능

> PATCH /groups/{group_id}/plans/{plan_id} - 그룹 약속 수정 (서버 수정)
```
&nbsp;

# DB 스키마 설계

users table
- id (INTEGER, NOT NULL, PRIMARY KEY)
- name (VARCHAR(100), NOT NULL)
- email (VARCHAR(100), NOT NULL)
- password (VARCHAR(100))
- image (VARCHAR(255))
- provider (VARCHAR(100), NOT NULL)
- created_at (TIMASTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMASTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

***

preferences table

- id (INTEGER, NOT NULL, PRIMARY KEY)
- user_id (INTEGER, NOT NULL) / reference 'id' in users table
- day_preference (JSONB, NOT NULL)
- time_preference (JSONB, NOT NULL)
- created_at (TIMASTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMASTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

***

groups table

- id (INTEGER, NOT NULL, PRIMARY KEY)
- name (VARCHAR(100), NOT NULL)
- image (VARCHAR(255))
- user_count (INTEGER, NOT NULL)
- invitation_code (VARCHAR(20))
- creator (INTEGER, NOT NULL) / reference 'id' in users table
- created_at (TIMASTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMASTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

***

participants table

- id (INTEGER, NOT NULL, PRIMARY KEY)
- user_id (INTEGER, NOT NULL) / reference 'id' in users table
- group_id (INTEGER, NOT NULL) / reference 'id' in groups table
- created_at (TIMASTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMASTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

***

plans table

- id (INTEGER, NOT NULL, PRIMARY KEY)
- group_id (INTEGER, NOT NULL) / reference 'id' in groups table
- name (VARCHAR(100), NOT NULL)
- plan_time (RANGE(TIMESTAMP))
- candidate_plan_time (ARRAY(255), NOT NULL)
- plan_time_slot (ARRAY(255), NOT NULL)
- minimum_user_count (INTEGER, NOT NULL)
- progress_time (FLOAT, NOT NULL)
- deadline (TIMASTAMP, NOT NULL)
- status (VARCHAR(100), NOT NULL)
- created_at (TIMASTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMASTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

***

submissions table

- id (INTEGER, NOT NULL, PRIMARY KEY)
- user_id (INTEGER, NOT NULL) / reference 'id' in users table
- plan_id (INTEGER, NOT NULL) / reference 'id' in plans table
- submission_time_slot (ARRAY(255), NOT NULL)
- created_at (TIMASTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMASTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)

***

# 약속 생성

0. 약속 생성 시, 클라이언트는 약속을 정할 날짜인 `date_list`랑 시간 범위인 `time_scope`를 아래와 같은 형식으로 보냄
```
date_list = ["2023-09-01", "2023-09-03"]
time_scope = {
    "start": "09:00",
    "end": "10:00"
}
```

1. 서버는 두 정보를 이용해서 해당 약속 시간대인 `plan_time_slot` 형태를 설정 (여기서 `available`에는 해당 시간대가 가능한 사용자들의 `user_id`가 들어갈 예정)
```
plan_time_slot = [
    { "time": "2023-09-01 09:00:00", "available": [] },
    { "time": "2023-09-01 09:30:00", "available": [] },
    { "time": "2023-09-01 10:00:00", "available": [] },
    { "time": "2023-09-03 09:00:00", "available": [] },
    { "time": "2023-09-03 09:30:00", "available": [] },
    { "time": "2023-09-03 10:00:00", "available": [] },
]
```

***

# 일정 제출

0. 그룹 참여자가 해당 약속에 자신의 일정인 `submission_time_slot` 을 다음과 같은 양식으로 제출
```
submission_time_slot = [
    { "time": "2023-09-01 09:00:00", "available": true },
    { "time": "2023-09-01 09:30:00", "available": true },
    { "time": "2023-09-01 10:00:00", "available": false },
    { "time": "2023-09-03 09:00:00", "available": false },
    { "time": "2023-09-03 09:30:00", "available": true },
    { "time": "2023-09-03 10:00:00", "available": true },
]
```

1. 서버는 약속의 status가 sumbit인지, 일정을 이미 제출했는지 확인

2. 제출된 일정의 `submission_time_slot`에서 available이 true인 요소들의 index를 저장하고, 약속의 `plan_time_slot`에서 해당 index에 속하는 요소의 `available`에 해당 `user_id`를 push

***

# 일정 수정

0. 그룹 참여자가 해당 약속에 자신의 일정인 `submission_time_slot` 을 다음과 같은 양식으로 제출
```
submission_time_slot = [
    { "time": "2023-09-01 09:00:00", "available": true },
    { "time": "2023-09-01 09:30:00", "available": true },
    { "time": "2023-09-01 10:00:00", "available": false },
    { "time": "2023-09-03 09:00:00", "available": false },
    { "time": "2023-09-03 09:30:00", "available": true },
    { "time": "2023-09-03 10:00:00", "available": true },
]
```

1. 서버는 약속의 status가 sumbit인지, 일정을 이미 제출했는지 확인

2. 약속의 `plan_time_slot`의 available에 해당 `user_id`를 모두 제거

3. 제출된 일정의 `submission_time_slot`에서 available이 true인 요소들의 index를 저장하고, 약속의 `plan_time_slot`에서 해당 index에 속하는 요소의 `available`에 해당 `user_id`를 push

***

# 약속 상태 업데이트 (Polling)

0. 클라이언트에서 setInterval로 초마다 서버에 약속 상태 업데이트를 요청

1. 서버는 요청한 사용자가 참여한 그룹의 목록을 로드

2. 불러온 각 그룹마다 약속 목록을 로드

3. 불러온 약속마다 해당 그룹의 인원수와 해당 약속의 일정 제출 수, 현재 날짜와 약속의 마감일 비교

4. 조건이 맞으면 해당 약속의 status를 calculate으로 변경

***

# 일정 후보 계산

0. 클라이언트는 약속의 status가 calculate일 때, 서버로 일정 후보 계산을 요청

1. 서버는 해당 약속의 status가 calculate인지 확인

2. 제출된 일정들의 submission_time_slot을 규합한 정보를 약속의 `plan_time_slot`에 저장

3. `plan_time_slot`에서 `minimum_user_count`와 `progress_time` 조건이 동시에 부합하는 시간대 검색


### 일정 후보 계산 성공
4. 조건이 맞는 시간대들은 `candiate_plan_time`에 저장
```
candiate_plan_time: [  
    {  
        start: DATE,  
        end: DATE
    },  
    ...  
]
```
5. 해당 약속의 status를 select로 변경

### 일정 후보 계산 실패
4. 그룹 생성자는 3가지 옵션(약속 조건의 재설정 / 직접 일정 선택 / 약속 취소) 중에서 하나를 선택
  
- 약속 조건의 재설정  
&ensp;5. `minimum_user_count`와 `progress_time`를 재설정  
&ensp;6. 이후 일정 후보를 다시 계산

- 직접 일정 선택  
&ensp;5. 그룹 생성자는 `plan_time_slot` 내에서 `progress_time`길이의 일정을 선택  
&ensp;6-1. 선택된 일정이 하나일 경우, 그룹 참여자의 투표 없이 해당 일정을 `plan_tiem`에 저장  
&ensp;6-2. 선택된 일정이 두 개 이상일 경우, 그룹 참여자의 투표를 진행하여 선택된 일정을 `plan_tiem`에 저장  
&ensp;7. 해당 약속의 status를 comfirm으로 변경 (select를 건너뜀)

- 약속 취소  
&ensp;5. 약속과 약속에 제출된 일정, 투표 정보들을 모두 삭제

***

# 일정 후보 선택

0. 클라이언트는 약속의 status가 select일 때, 서버로 일정 후보 선택을 요청

1. 서버는 해당 약속의 status가 select인지 확인

2. `candiate_plan_time`에 일정이 하나인 경우 해당 일정을 `plan_time`으로 저장하고, 해당 약속의 상태를 comfirm으로 변경

3. `candiate_plan_time`에 일정이 두 개 이상인 경우, 그룹 참가자들의 요일 선호도와 시간 선호도의 평균과 가중치를 계산
```
avg_day_preference: {
    Mon: mon_average,
    Tue: tue_average,
    Wed: wed_average,
    Thu: thu_average,
    Fri: fri_average,
    Sat: sat_verage,
    Sun: sun_average,
},
day_preference_weight: dw,

avg_time_preference: {
    morning: m_average,
    afternoon: a_average,
    evening: e_average,
},
time_preference_weight: tw,
```

4. 평균과 가중치 값으로 그룹 요일 선호도, 그룹 시간 선호도를 계산
```
group_day_preference: {
    Mon: mon_average * dw,
    Tue: tue_average * dw,
    Wed: wed_average * dw,
    Thu: thu_average * dw,
    Fri: fri_average * dw,
    Sat: sat_verage * dw,
    Sun: sun_average * dw,
},

group_time_preference: {
    morning: m_average * tw,
    afternoon: a_average * tw,
    evening: e_average * tw,
},
```

5. 각 그룹 선호도 중에서 최댓값을 최종 그룹 선호도로 선택
```
final_group_day_preference: {
    maximum of group_day_preference,
    ...(최댓값이 같은 경우 추가됨)
},

final_group_time_preference: {
    maximum of group_time_preference,
    ...(최댓값이 같은 경우 추가됨)
},
```

6. `candiate_plan_time` 중에서 최종 그룹 선호도 조건에 가장 많이 부합하는 일정을 `plan_time`으로 저장하고, 해당 약속의 상태를 comfirm으로 변경
