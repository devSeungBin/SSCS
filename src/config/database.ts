import { Pool } from "pg";

export const connection = new Pool({
    user : 'test',
    host : 'localhost',
    database : 'SSCS',
    password : '1234',
    port : 5432,
})