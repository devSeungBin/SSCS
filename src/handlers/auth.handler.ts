import { Request, Response } from 'express';
import { createUserDto } from '../dtos/auth.interface';
import { CreateUserQueryParams } from '../types/query-params';
import { User } from '../types/response';

import { connection } from '../config/database';
import oauth from '../config/oauth';
import axios from 'axios';


const getAccessToken = async (code: any) => {
    await axios
    .post(oauth.GOOGLE_TOKEN_URL, {
      	code,
        client_id: oauth.GOOGLE_CLIENT_ID,
        client_secret: oauth.GOOGLE_CLIENT_SECRET,
        redirect_uri: oauth.GOOGLE_LOGIN_REDIRECT_URL,
        grant_type: 'authorization_code',
    })
    .then(async (res) => {
        const data = res.data;
        const access_token = data.access_token;
        getUserInfo(access_token);
    })
    .catch((err) => {
        const data = err.response.data;
        console.log(data.msg, data.errorCode);
    });
}

const getUserInfo = async (access_token: any) => {
    await axios
    .get(oauth.GOOGLE_USERINFO_URL, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    })
    .then((res) => {
        const data = res.data;
        console.log(access_token);
        console.log(data);
        userExist(data, access_token);
    })
    .catch((err) => {
        const data = err.response.data;
        console.log(data.msg, data.errorCode);
    });
}

const searchUser = async (email: String) => {
    const postdb = await connection.connect();
  	const search_user_SQL = "SELECT * FROM public.sscs_user WHERE email = $1";
    const params = [email];
    try {        
        return new Promise((resolve, rejects) => {
            postdb.query(search_user_SQL, params, (err, res)=>{
                if(err){
                    rejects(err);
                }
                resolve(res);
            });
        })
    } catch (err) {
        throw err;
    } finally {
        postdb.release();
    }
}

const createUser = async (name: any, email: any, image: any, access_token: any) => {
    const postdb = await connection.connect();
  	const create_user_SQL = "INSERT INTO sscs_user(name, email, image, access_token) VALUES ($1, $2, $3, $4);";
    const params = [name, email, image, access_token];
    try {        
        return new Promise((resolve, rejects) => {
            postdb.query(create_user_SQL, params, (err, res)=>{
                if(err){
                    rejects(err);
                }
                resolve(res);
            });
        })
    } catch (err) {
        throw err;
    } finally {
        postdb.release();
    }
}

const updateUser = async (email: any, access_token: any) => {
    const postdb = await connection.connect();
  	const update_user_SQL = "UPDATE sscs_user SET access_token = $1 WHERE email = $2;";
    const params = [access_token, email];
    try {        
        return new Promise((resolve, rejects) => {
            postdb.query(update_user_SQL, params, (err, res)=>{
                if(err){
                    rejects(err);
                }
                resolve(res);
            });
        })
    } catch (err) {
        throw err;
    } finally {
        postdb.release();
    }
}

const userExist = async (data: any, access_token: any) => {
    try {
        const userInfo: any = await searchUser(data.email);
        console.log(userInfo.rows);
        console.log(userInfo.rowCount);
        if(userInfo.rowCount > 0) {
           updateUser(data.email, access_token);
           console.log("이미 유저가 존재합니다.");
        } else {
            createUser(data.name, data.email, data.picture, access_token);
            console.log("새로운 유저입니다.");
        } 
    } catch (err) {      
        console.error("post /test",err);
    }
}


export function requestLogin(req: Request, res: Response) {
    let url = 'https://accounts.google.com/o/oauth2/v2/auth';
    url += `?client_id=${oauth.GOOGLE_CLIENT_ID}`;
    url += `&redirect_uri=${oauth.GOOGLE_LOGIN_REDIRECT_URL}`;
    url += '&response_type=code';
    url += '&scope=email profile openid'; 
	res.redirect(url);
}

export async function redirectLogin(req: Request, res: Response) {
    const { code } = req.query;
    getAccessToken(code);
    res.send('로그인 성공');
}

// export function createUser(
//     request: Request<{}, {}, createUserDto, CreateUserQueryParams>, 
//     response: Response<User>
// ) {
//     response.status(201).send({
//         id: 1,
//         username: "unknown",
//         email: "unknown@mail.com"
//     })
// }
