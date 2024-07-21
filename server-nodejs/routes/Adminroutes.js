const express = require('express');
const router = express.Router();
const AdminController = require('../controller/AdminController');
const { AuthToken } = require('../middleware/authmid'); // Import the auth middleware functions

// Define routes for managing storage items
router.post('/add-storeitem', AuthToken, AdminController.addItemToStorage); // Add a new item to storage
router.put('/update-storeitem', AuthToken, AdminController.updateStorageItem); // Update an existing storage item
router.delete('/delete-storeitem', AuthToken, AdminController.deleteItemFromStorage); // Delete an item from storage

// Define routes for managing items
router.post('/create-item', AuthToken, AdminController.createItem); // Create a new item
router.put('/update-item', AuthToken, AdminController.updateItem); // Update an existing item
router.delete('/delete-item', AuthToken, AdminController.deleteItem); // Delete an item

// Define routes for managing user pets
router.post('/create-userpets', AuthToken, AdminController.createUserPet); // Add a new pet for a user
router.put('/update-userpets', AuthToken, AdminController.updateUserPet); // Update an existing user pet
router.delete('/delete-userpets', AuthToken, AdminController.deleteUserPet); // Delete a user pet

// Define routes for managing pets
router.post('/add-pets', AuthToken, AdminController.addPet); // Add a new pet
router.put('/update-pets', AuthToken, AdminController.updatePet); // Update an existing pet
router.delete('/delete-pets', AuthToken, AdminController.deletePet); // Delete a pet

// Define routes for updating and deleting users
router.put('/update-user', AuthToken, AdminController.updateUser); // Update user details (username, password, etc.)
router.delete('/delete-user', AuthToken, AdminController.deleteUser); // Delete a user

module.exports = router;
