# 9/2

- 기초 서버 구축
    0. Node.js 세팅
        - pakage.json 설정
            (npm init -y)
            

    1. 기초 서버 구성을 위한 패키지 설치
        - Express 패키지

        - @types/express 패키지 / dev
            (Express 내장 기능들의 타입 정보를 담고 있는 패키지)
            
        - nodemon 패키지 / dev
            (코드 수정 후 서버의 빠른 재시작을 위한 패키지)
            
    
    2. Typescript 사용을 위한 패키지 설치
        - Typescript 패키지 / dev
            (Node.js에선 Javascript만 사용하므로 .ts 파일을 .js로 컴파일하는 과정이 필요. Typescript 패키지에는 타입스크립트 컴파일러가 동봉됨)
            
        - ts-node 패키지 / dev
            (Node.js에서 .ts 파일을 .js로 컴파일하고 node로 실행하는 과정을 명령어 한번으로 줄여주는 도구로, nodemon 패키지와 연계됨) 
            
        - ~~@types/node 패키지 / dev~~
            ~~(Node.js 내장 기능들의 타입 정보를 담고 있는 패키지)~~
            
    
    3. Typescript 세팅
        - tsconfig.json 설정
            (npx tsc --init)
            
    
    4. .gitignore 파일 작성
    

    5. 서버 폴더 구성
        - /dist
            distribution의 약자로 배포를 의미하며, 실제 운영 환경에서 사용될 컴파일된 .js 파일들이 있슴
            
        - /src
            source의 약자로 컴파일 되기 전인 .ts 파일들이 있슴
            
        - /routers
            APi 엔드포인트 처리를 관리하는  라우터 파일들이 있슴
            
        - /handlers
            각 API 마다 사용될 비즈니스 로직을 정의한 라우터 핸들러 파일들이 있슴
            
        - /dtos
            Data Transfer Object(데이터 전송 객체)로 프로세스 간 데이터를 전달하는 객체 파일들이 있슴 (비즈니스 로직  같은 복잡한 코드가 없으며 오직 순수하게 전달하고 싶은 데이터만 정의됨)
            
        - /types
            공통으로 사용될 타입이 정의된 파일들이 있슴
            
        - /models
            db 관련 모델 파일들이 있슴
            
        - /config
            서버 설정 관련 파일들이 있슴


# 9/3



