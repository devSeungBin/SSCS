import { Request, Response, Router } from "express";
import { getUsers, getUsersById, createUser, searchUser } from "../handlers/users";

const router = Router();


// /api/users
router.get('/', getUsers);

router.get('/:id', getUsersById);

router.post('/', createUser);

router.post('/test', async (req: Request, res: Response) => {
    console.log(req.body);   
    const userEmail: String = req.body.email;
    const userPwd: String = req.body.password;
    
    try {
        const result:any = await searchUser(userEmail, userPwd);
        console.log(result.rows);
        console.log(result.rowCount);
        if(result.rowCount > 0){
            res.status(200).send({
                success: true,
                result : result.rows
            });
        }else{
            res.status(400).send({
                success: false,
                message: "Resource Null"
            });
        } 
    } catch (err) {      
        console.error("post /test",err);
        res.status(500).send({
            success: false,
            message: "Server Error"
        });
    }
});

export default router;