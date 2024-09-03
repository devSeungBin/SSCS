// 서버 import
import express, { NextFunction, Request, Response } from 'express';

// 라우터 import
import usersRouter from './routers/users';

// Swagger import
import swaggerUi from 'swagger-ui-express';
import swaggerJson from './swagger.json';

const app = express();
const PORT = 3000;

app.use(express.urlencoded({extended:true}));   //application/x-www-form-urlencoded (x-www-form-urlencoded 형태의 요청 body를 파싱)
app.use(express.json());                        //application/json (JSON 형태의 요청 body를 파싱)

app.use('/api/users', usersRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));

// 서버 오픈
app.listen(PORT, () => {
    console.log(`[Server] 서버를 정상적으로 열었습니다.`);
});
