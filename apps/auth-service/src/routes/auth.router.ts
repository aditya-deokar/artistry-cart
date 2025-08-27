import  express,  { Router }  from "express";
import { createShop, createStripeConnection, getSeller, getUser, loginSeller, loginUser, logoutUser, refreshToken, registerSeller, resetUserPassword, userForgotPassword, userRegistration, verifySeller, verifyUser, verifyUserForgotPassword } from "../controller/auth.controller";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";
import { isSeller } from "../../../../packages/middleware/authorizedRoles";
import { createAddress, deleteAddress, getCurrentUser, getOrderDetails, getUserAddresses, getUserOrders, updateAddress, updateUserDetails } from "../controller/user.controller";


const router:Router = express.Router();

router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', loginUser);
router.get('/logout-user', logoutUser);

router.post("/refresh-token", refreshToken)
router.get("/logged-in-user",isAuthenticated, getUser)


router.post('/forgot-password-user', userForgotPassword);
router.post('/reset-password-user', resetUserPassword);
router.post('/verify-forgot-password-user', verifyUserForgotPassword);

router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);

router.post("/create-stripe-link", createStripeConnection);
router.post("/login-seller", loginSeller);
router.get("/logged-in-seller", isAuthenticated, isSeller, getSeller);





// Profile Details
router.get('/me',isAuthenticated,  getCurrentUser);
router.patch('/me', isAuthenticated, updateUserDetails);
// router.post('/me/avatar', upload.single('avatar'), updateUserAvatar);

// Order History
router.get('/me/orders', isAuthenticated, getUserOrders);
router.get('/me/orders/:orderId', getOrderDetails);

// Address Book
router.get('/me/addresses', isAuthenticated, getUserAddresses);
router.post('/me/addresses', isAuthenticated, createAddress);
router.patch('/me/addresses/:addressId', isAuthenticated, updateAddress);
router.delete('/me/addresses/:addressId', isAuthenticated, deleteAddress);


router.get('/get', (req, res) => {
    res.send({ 'message': 'Hello API Router  Auth Service'});
});

export default router;