// express import
const express = require('express');
const session = require('express-session');

// swagger import
const swaggerUi = require('swagger-ui-express');
const swaggerJson = require('./swagger.json');

// passport import
const passport = require('passport');
const passportConfig = require('./passport');

// cors import
const cors = require('cors');

// cookie-parser import
const cookieParser = require('cookie-parser');

// 사용자 정의 import
const keys = require('./config/keys.config');


// 서버 세부설정
const app = express();

passportConfig()

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(cookieParser(keys.COOKIE_SECRET));
app.use(session({
      resave: false,
      saveUninitialized: false,
      secret: keys.COOKIE_SECRET,
      cookie: {
         httpOnly: true,
         secure: false,
      },
   }),
);

app.use(passport.initialize());
app.use(passport.session());

const client = `http://${keys.CLIENT_HOST}:${keys.CLIENT_PORT}`;
const corsOption = {
    origin: client,
    methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
    credentials: true,
}
app.use(cors(corsOption));


// 라우터 세부설정
const testRouter = require('./routers/test.router');
const authRouter = require('./routers/auth.router');
const preferenceRouter = require('./routers/preference.router');
const groupRouter = require('./routers/group.router');

app.use('/test', testRouter);
app.use('/auth', authRouter);
app.use('/preference', preferenceRouter);
app.use('/group', groupRouter);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));


// 서버 오픈
app.listen(keys.CLIENT_PORT, () => {
    console.log(`[Server] 서버를 정상적으로 열었습니다.`);
});
