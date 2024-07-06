const express = require('express');
const router = express.Router();
const AdminController = require('../controller/AdminController');
const { AuthToken } = require('../middleware/authmid'); // Import the auth middleware functions

// Define routes for adding, updating, and deleting storage items
router.post('/add-item', AuthToken,AdminController.addItemToStorage);
router.put('/update-item',AuthToken, AdminController.updateStorageItem);
router.delete('/delete-item',AuthToken ,AdminController.deleteItemFromStorage);


// Define routes for adding, updating, and deleting an items
router.post('/create-item',AuthToken,AdminController.createItem);
router.put('/update-item',AuthToken, AdminController.updateItem);
router.delete('/delete-item',AuthToken, AdminController.deleteItem);


module.exports = router;