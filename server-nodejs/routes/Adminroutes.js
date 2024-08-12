const express = require('express');
const router = express.Router();
const multer = require('multer');
const AdminController = require('../controller/AdminController');
const { AuthToken ,checkIsadmin } = require('../middleware/authmid'); // Import the auth middleware functions

// ตั้งค่า multer สำหรับการอัปโหลดไฟล์
const storage = multer.memoryStorage(); // ใช้ memoryStorage เพื่อเก็บไฟล์ในหน่วยความจำ
const upload = multer({ storage: storage });

// Define routes for managing storage items
router.post('/add-storeitem', AuthToken, AdminController.addItemToStorage); // Add a new item to storage
router.put('/update-storeitem', AuthToken, AdminController.updateStorageItem); // Update an existing storage item
router.delete('/delete-storeitem', AuthToken, AdminController.deleteItemFromStorage); // Delete an item from storage

// Define routes for managing items
router.post('/create-item', AuthToken, upload.single('itemImage'),AdminController.createItem); // Create a new item
router.put('/update-item', AuthToken,upload.single('itemImage'), AdminController.updateItem); // Update an existing item
router.delete('/delete-item', AuthToken, AdminController.deleteItem); // Delete an item

// Define routes for managing user pets
router.post('/create-userpets', AuthToken, AdminController.createUserPet); // Add a new pet for a user
router.put('/update-userpets', AuthToken, AdminController.updateUserPet); // Update an existing user pet
router.delete('/delete-userpets', AuthToken, AdminController.deleteUserPet); // Delete a user pet

// Define routes for managing pets
router.post('/add-pets', AuthToken,upload.single('petImage'), AdminController.addPet); // Add a new pet
router.put('/update-pets', AuthToken,upload.single('petImage'),AdminController.updatePet); // Update an existing pet
router.delete('/delete-pets', AuthToken, AdminController.deletePet); // Delete a pet

// Define routes for updating and deleting users
router.put('/update-user', AuthToken, AdminController.updateUser); // Update user details (username, password, etc.)
router.delete('/delete-user', AuthToken, AdminController.deleteUser); // Delete a user

// Define route for setting user ban status
router.put('/set-userban', AuthToken, AdminController.setUserBan); // Set user's ban status

// Define route for getting all users, items, pets, and storage items
router.get('/users', AuthToken, AdminController.getAllUsers); // Get all users
router.get('/items', AuthToken, AdminController.getAllItems); // Get all items
router.get('/pets', AuthToken, AdminController.getAllPets); // Get all pets
router.get('/storage', AuthToken, AdminController.getAllStorage); // Get all storage items

// test routes
router.post('/test-admin', AuthToken, checkIsadmin, (req, res) => {
    res.send('Welcome to the admin');
});

module.exports = router;
