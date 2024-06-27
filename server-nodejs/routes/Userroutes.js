const express = require('express');
const router = express.Router();
const UserController = require('../controller/UserController')
const AuthMiddleware = require('../middleware/authmid');

//router.get('/data', AuthMiddleware, UserController.dataUser); //to test auth

//Route Login & Register
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);

//Route Verification Email
router.post('/verifyemail', UserController.verifyEmail);
router.post('/send-verifyemail', UserController.sendVerifyEmail);

//Route Check Email is Taken
router.post('/check-email', UserController.checkEmail);

//Route Reset Password
router.post('/sent-resetpassword',UserController.resetpasswordemail);
router.post('/validate-resetpasstoken', UserController.validateResetToken);
router.post('/resetpassword', UserController.resetpassword);
router.post('/validate-newpassword',UserController.checkOldPassword);

// Use the controller function for generating extension tokens
router.post('/extensionsToken', UserController.tokenExtensionsGenerate);


module.exports = router;
