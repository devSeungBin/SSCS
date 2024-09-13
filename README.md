# 벡엔드 현재 진행상황

0. 기초 서버 구성
    - Javascript + Express 기반 서버 구축
    - 임시 API 구현 및 테스트
    - API 문서 자동화 구현 및 테스트
    - PostgreSQL 기반 DB 구축
        - 필요한 DB 스키마 설계
        - 서버와 DB 연동

이후는 목표 동작 시나리오대로 기능을 구현


1. 그룹 참여 단계
    
    메인 페이지에서 회원가입 이후 로컬 또는 구글 로그인을 진행한다.
    첫 로그인 시 사용자 일정 선호도를 먼저 입력한 후 사용자 홈 페이지로 이동한다.
    (사용자 개인 정보 또는 일정 선호도는 사용자 설정 페이지에서 변경할 수 있다.)
    사용자 홈 페이지에서 새 그룹을 생성하거나 다른 그룹에 참여한다.
    
    필요한 API - 기능
    - GET /users - 모든 사용자 정보 조회
    - POST /users - 로컬 회원가입
    - GET /users/login - 구글 로그인 (GET /users/login/callback - 리다이렉트)
    - POST /users/login - 로컬 로그인
    - GET /users/{user_id} - 단일 사용자 정보 조회
    - POST /users/{user_id} - 사용자 선호도 정보 생성 (첫 로그인 시)
    - PATCH /users/{user_id} - 사용자 정보 수정
    - DELETE /users/{user_id} - 사용자 탈퇴
    - GET /users/{user_id}/plans - 사용자 개인 약속 조회
