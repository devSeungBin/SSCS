# 벡엔드 목표 리스트 

**0. 기초 서버 구성**  
- Javascript + Express 기반 서버 구축
- 임시 API 구현 및 테스트
- API 문서 자동화 구현 및 테스트
- PostgreSQL 기반 DB 구축
    - 필요한 DB 스키마 설계
    - 서버와 DB 연동

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

> GET /users - 사용자 정보 조회
> POST /users - 로컬 회원가입
> PATCH /users - 사용자 정보 수정
> DELETE /users - 사용자 탈퇴

> GET /users/login - 구글 로그인 (GET /users/login/callback - 리다이렉트)
> POST /users/login - 로컬 로그인

> POST /users/preference - 사용자 선호도 정보 생성

> GET /users/plans - 사용자 개인 약속 조회

> POST /groups - 새 그룹 생성

> POST /groups/{group_id}/invite - 그룹 참여자 생성
```

***

**2. 약속 생성 단계**

사용자 홈 페이지에서 자신이 참여한 그룹 목록을 확인한다.  
그룹 페이지에서 해당 그룹에 참여한 그룹 참여자 목록과 **특정 날짜**의 약속 목록을 확인인다.  
그룹 페이지에서 새로운 약속(1 단계)을 생성한다.  

(**특정 날짜**는 그룹 페이지 중앙에 위치한 그룹 캘린더에서 선택한다.)  
(그룹 생성자는 그룹의 이름 또는 그룹 초대코드를 수정할 수 있다.)

```
> 필요한 API - 기능

> GET /groups - 모든 그룹 정보 조회 (사용자가 참여한)

> GET /groups/{group_id} - 단일 그룹 정보 조회
> PATCH /groups/{group_id} - 그룹 정보 수정
> DELETE /groups/{group_id} - 그룹 삭제

> GET /groups/{group_id}/members - 그룹 참여자 정보 조회
> DELETE /groups/{group_id}/members - 그룹 탈퇴

> GET /groups/{group_id}/invite - 그룹 참여코드 조회 (코드 재생성)

> GET /groups/{group_id}/plans - 그룹 약속 목록 조회
> POST /groups/{group_id}/plans - 그룹 약속 생성

> PATCH /groups/{group_id}/plans/{plan_id} - 그룹 약속 수정 (0 단계)
> DELETE /groups/{group_id}/plans/{plan_id} - 그룹 약속 삭제
```

***

**3. 일정 후보 계산 단계**

그룹 참여자는 약속(1 단계)에 지정된 날짜 범위 내에서 자신의 일정을 마감일까지 제출한다.  
모든 참여자가 일정을 제출했거나 마감일이 지나면, 일정 제출이 마감되고 제출된 일정을 바탕으로 시간대가 겹치는 부분인 일정 후보를 계산한다.  
만약 약속 조건에 부합하는 일정 후보가 계산되지 않는 경우, **네 가지 옵션**이 제공된다.  

(사용자는 직접 일정을 입력하거나, 구글 캘린더에서 일정 정보를 가져와 입력한다.)  
(참여자는 일정 후보가 계산되기 전까지 자신이 제출한 일정 정보를 수정할 수 있다.)  

> **네 가지 옵션**  
> 1. 그룹 생성자는 약속 조건을 수정한 후 일정 후보를 다시 계산한다.  
> 2. 일정 후보 계산을 건너뛰고 그룹 생성자가 바로 일정을 선택한다.  
> 3. 일정 후보 계산을 건너뛰고 그룹 참여자들의 투표로 바로 일정을 선택한다.  
> 4. 약속 생성을 취소한다. (약속 생성 실패)  

*일정 후보 계산을 시작하면, 제출된 참여자들의 일정들이 겹치는 시간대를 계산한다. 이때 겹치는 시간대를 계산하는 이유는 제출할 일정 입력 시 사용자가 가능한 시간대를 입력받기 때문이다.*

```
> 필요한 API - 기능

> PATCH /groups/{group_id}/plans/{plan_id} - 그룹 약속 수정 (1 단계)

> GET /groups/{group_id}/plans/{plan_id}/schedules - 제출된 (본인) 일정 확인
> POST /groups/{group_id}/plans/{plan_id}/schedules - 일정 제출
> PATCH /groups/{group_id}/plans/{plan_id}/schedules - 제출된 일정 수정
> DELETE /groups/{group_id}/plans/{plan_id}/schedules - 제출된 일정 삭제
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

> PATCH /groups/{group_id}/plans/{plan_id} - 그룹 약속 수정 (3 단계)
```

