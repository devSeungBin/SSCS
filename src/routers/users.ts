import { Router } from "express";
import { getUsers, getUsersById, createUser } from "../handlers/users";

const router = Router();


// /api/users
router.get('/', getUsers);

router.get('/:id', getUsersById);

router.post('/', createUser);

export default router;