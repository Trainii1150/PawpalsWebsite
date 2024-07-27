const express = require('express');
const router = express.Router();
const UserController = require('../controller/UserController');
const { AuthToken } = require('../middleware/authmid'); // Import the auth middleware functions

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
