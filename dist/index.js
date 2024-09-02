"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./routers/users"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use('/api/users', users_1.default);
app.listen(PORT, () => {
    console.log(`[Server] 서버를 정상적으로 열었습니다.`);
});
