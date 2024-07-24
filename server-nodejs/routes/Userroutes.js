const express = require('express');
const router = express.Router();
const UserController = require('../controller/UserController');
const { AuthToken } = require('../middleware/authmid'); // Import the auth middleware functions

// Route Login & Register
router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);

// Route Verification Email
router.post('/verifyemail', UserController.verifyEmail);
router.post('/send-verifyemail', UserController.sendVerifyEmail);

// Route Check Email is Taken
router.post('/check-email', UserController.checkEmail);

// Route Reset Password
router.post('/sent-resetpassword', UserController.resetpasswordemail);
router.post('/validate-resetpasstoken', UserController.validateResetToken);
router.post('/resetpassword', UserController.resetpassword);
router.post('/validate-newpassword', UserController.checkOldPassword);

// Use the controller function for generating extension tokens
router.post('/extensionsToken', UserController.tokenExtensionsGenerate);

// Route Item user
router.post('/buy-item', AuthToken, UserController.buyItem);
router.delete('/delete-item', AuthToken, UserController.deleteItemfromStorage);

// Routes for user pets
router.post('/buy-userpets', AuthToken, UserController.createUserPet);
router.post('/feed-pet', AuthToken, UserController.feedPet);
router.put('/update-userpets', AuthToken, UserController.updateUserPet);
router.delete('/delete-userpets', AuthToken, UserController.deleteUserPet);
router.post('/randomize-pet', AuthToken, UserController.randomizePet); // เพิ่ม AuthToken ที่นี่

module.exports = router;
