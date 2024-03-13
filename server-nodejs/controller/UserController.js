const userModel = require('../model/Usermodel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
//const date = new Date();

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await userModel.createUser(username, email, password);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.getUserEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jwt.sign({user : user.username},process.env.Accesstoken,{expiresIn:"5m"});
        //console.log(`Token Generated at:- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
        res.json({ message: 'Login successful ',token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

module.exports = {
    registerUser,
    loginUser,
};