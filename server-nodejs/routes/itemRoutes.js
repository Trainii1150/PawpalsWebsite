const express = require('express');
const router = express.Router();
const itemController = require('../controller/ItemController');

router.post('/', itemController.createItem);
router.put('/:item_id', itemController.updateItem);
router.delete('/:item_id', itemController.deleteItem);


module.exports = router;