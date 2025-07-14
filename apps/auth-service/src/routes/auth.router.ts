import  express,  { Router }  from "express";
import { loginUser, resetUserPassword, userForgotPassword, userRegistration, verifyUser } from "../controller/auth.controller";
import { verifyForgotPasswordOTP } from "../utils/auth.helper";


const router:Router = express.Router();

router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', loginUser);
router.post('/forgot-password-user', userForgotPassword);
router.post('/reset-password-user', resetUserPassword);
router.post('/verify-forgot-password-user', verifyForgotPasswordOTP);

router.get('/get', (req, res) => {
    res.send({ 'message': 'Hello API Router  Auth Service'});
});

export default router;