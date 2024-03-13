const express = require('express');
const router = express.Router();
const UserController = require('../controller/UserController')
const Middleauth = require('../middleware/middleauth');

router.post('/register',UserController.registerUser)
router.post('/login',UserController.loginUser)
router.post('/testhome',Middleauth,(req,res)=>{
    res.status(200).send("Welcome to my pawpalsworld!");
})

module.exports = router;