// express import
const express = require('express');

// Swagger import
const swaggerUi = require('swagger-ui-express');
const swaggerJson = require('./swagger.json');


// 서버 세부설정
const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());

const testRouter = require('./routers/test.router');

app.use('/test', testRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));


// 로그인을 위한 테스트 / 페이지
app.get('/', (req, res) => {
    res.send(`
        <h1>OAuth Test</h1>
        <a href="/auth/login">Log in</a>
        <a href="/auth/signup">Sign up</a>
    `);
});


// 서버 오픈
app.listen(3000, () => {
    console.log(`[Server] 서버를 정상적으로 열었습니다.`);
});
