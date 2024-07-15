const express = require('express');
const router = express.Router();
const AdminController = require('../controller/AdminController');
const { AuthToken } = require('../middleware/authmid'); // Import the auth middleware functions

// Define routes for adding, updating, and deleting storage items
router.post('/add-storeitem', AuthToken,AdminController.addItemToStorage);
router.put('/update-storeitem',AuthToken, AdminController.updateStorageItem);
router.delete('/delete-storeitem',AuthToken ,AdminController.deleteItemFromStorage);


// Define routes for adding, updating, and deleting an items
router.post('/create-item',AuthToken,AdminController.createItem);
router.put('/update-item',AuthToken, AdminController.updateItem);
router.delete('/delete-item',AuthToken, AdminController.deleteItem);


// Define routes for adding, updating, and deleting an pet's users
router.post('/create-userpets',AuthToken, AdminController.createUserPet);
router.put('/update-userpets', AuthToken,AdminController.updateUserPet);
router.delete('/delete-userpets',AuthToken, AdminController.deleteUserPet);


// Define routes for adding, updating, and deleting an pets
router.post('/add-pets', AdminController.addPet);
router.put('/update-pets', AdminController.updatePet);
router.delete('/delete-pets', AdminController.deletePet);

module.exports = router;