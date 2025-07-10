import  express,  { Router }  from "express";
import { userRegistration, verifyUser } from "../controller/auth.controller";


const router:Router = express.Router();

router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);

router.get('/get', (req, res) => {
    res.send({ 'message': 'Hello API Router  Auth Service'});
});

export default router;