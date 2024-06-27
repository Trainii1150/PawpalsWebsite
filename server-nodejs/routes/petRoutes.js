const express = require('express');
const router = express.Router();
const petController = require('../controller/PetController');

router.post('/', petController.createPet);
router.put('/:pets_id', petController.updatePet);
router.delete('/:pets_id', petController.deletePet);

module.exports = router;
