const express = require('express');
const router = express.Router();
const AuthController = require('../controller/AuthController');

// Route Login & Register
router.post('/register', AuthController.registerUser);
router.post('/login', AuthController.loginUser);

// Route Verification Email
router.post('/verifyemail', AuthController.verifyEmail);
router.post('/send-verifyemail', AuthController.sendVerifyEmailHandler);

// Route Check Email is Taken
router.post('/check-email', AuthController.checkEmail);

// Route Reset Password
router.post('/sent-resetpassword', AuthController.resetpasswordemail);
router.post('/validate-resetpasstoken', AuthController.validateResetToken);
router.post('/resetpassword', AuthController.resetpassword);
router.post('/validate-newpassword', AuthController.checkOldPassword);

// Use the controller function for generating extension tokens
router.post('/extensionsToken', AuthController.tokenExtensionsGenerate);

// Route for Refreshing Tokens
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;