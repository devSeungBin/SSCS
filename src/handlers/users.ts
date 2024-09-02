import { Request, Response } from 'express';
import { createUserDto } from '../dtos/CreateUser.dto';
import { CreateUserQueryParams } from '../types/query-params';
import { User } from '../types/response';

export function getUsers(request: Request, response: Response) {
    response.send([])
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