// 서버 import
import express, { NextFunction, Request, Response } from 'express';

// 라우터 import
import usersRouter from './routers/users';

const app = express();
const PORT = 3000;


app.use('/api/users', usersRouter);

// 서버 오픈
app.listen(PORT, () => {
    console.log(`[Server] 서버를 정상적으로 열었습니다.`);
});
