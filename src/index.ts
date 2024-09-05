// 서버 import
import express, { NextFunction, Request, Response } from 'express';

// 라우터 import
import authRouter from './routers/auth.router';

// Swagger import
import swaggerUi from 'swagger-ui-express';
import swaggerJson from './swagger.json';

// cors import
import cors from 'cors';

// 사용자 정의 import
import address from './config/address';


const app = express();
const PORT = 3000;

app.use(express.urlencoded({extended:true}));   //application/x-www-form-urlencoded (x-www-form-urlencoded 형태의 요청 body를 파싱)
app.use(express.json());                        //application/json (JSON 형태의 요청 body를 파싱)

const client = `http://${address.CLIENT_HOST}:${address.CLIENT_PORT}`;
const corsOption = {
    origin: client,
    methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
    credentials: true,
}
app.use(cors(corsOption));


// 로그인을 위한 테스트 / 페이지
app.get('/', (req: Request, res: Response) => {
    res.send(`
        <h1>OAuth Test</h1>
        <a href="/auth/login">Log in</a>
        <a href="/auth/signup">Sign up</a>
    `);
});
app.use('/auth', authRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));

// 서버 오픈
app.listen(PORT, () => {
    console.log(`[Server] 서버를 정상적으로 열었습니다.`);
});
