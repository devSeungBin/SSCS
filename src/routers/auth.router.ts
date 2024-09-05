import { Request, Response, Router } from "express";
import { requestLogin, redirectLogin } from "../handlers/auth.handler";

const router = Router();

// /auth
router.get('/login', requestLogin);

router.get('/login/redirect', redirectLogin);

router.post('/test', async (req: Request, res: Response) => {
    // console.log(req.body);   
    // const userEmail: String = req.body.email;
    // const userPwd: String = req.body.password;
    
    // try {
    //     const result:any = await searchUser(userEmail, userPwd);
    //     console.log(result.rows);
    //     console.log(result.rowCount);
    //     if(result.rowCount > 0){
    //         res.status(200).send({
    //             success: true,
    //             result : result.rows
    //         });
    //     }else{
    //         res.status(400).send({
    //             success: false,
    //             message: "Resource Null"
    //         });
    //     } 
    // } catch (err) {      
    //     console.error("post /test",err);
    //     res.status(500).send({
    //         success: false,
    //         message: "Server Error"
    //     });
    // }
});

export default router;