"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUsersById = getUsersById;
exports.createUser = createUser;
function getUsers(request, response) {
    response.send([]);
}
function getUsersById(request, response) {
    response.send([]);
}
function createUser(request, response) {
    response.status(201).send({
        id: 1,
        username: "unknown",
        email: "unknown@mail.com"
    });
}
