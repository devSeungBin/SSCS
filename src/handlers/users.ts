import { Request, Response } from 'express';
import { createUserDto } from '../dtos/CreateUser.dto';
import { CreateUserQueryParams } from '../types/query-params';
import { User } from '../types/response';

import { connection } from '../config/database';

export const searchUser = async(userEmail: String, userPwd: String) => {
    const postdb = await connection.connect();
  	const search_User_SQL = "select * from public.\"user\" where email = $1 and password = $2";
    const params = [userEmail, userPwd];
    try {        
        return new Promise((resolve, rejects)=>{
            postdb.query(search_User_SQL, params, (err, res)=>{
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

export function getUsers(request: Request, response: Response) {
    response.send(["hello"])
}

export function getUsersById(request: Request, response: Response) {
    response.send([])
}

export function createUser(
    request: Request<{}, {}, createUserDto, CreateUserQueryParams>, 
    response: Response<User>
) {
    response.status(201).send({
        id: 1,
        username: "unknown",
        email: "unknown@mail.com"
    })
}