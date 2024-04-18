const userModel = require('../model/Usermodel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
//const date = new Date();

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await userModel.createUser(username, email, password);
        const token = tokenEmailVerificationGenerate(username,email);
        sendVerifyEmail(email,token);
        console.log(token);
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
        res.json({ user: user.username,token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};


const tokenEmailVerificationGenerate = (user, email) => {
    return jwt.sign({user,email},process.env.EmailVerificationToken,{expiresIn:"1h"});
}

const verifyEmail = async (req,res) => {
    const token = req.query.token;

    if(!token){
        return res.status(400).json({ error: 'Token is missing' });
    }
    else{

    }
}

const resendverifyEmail = async (req,res) => {
    const { email } = req.body;

    try {
        const user = await userModel.getUserEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }
        const token = generateEmailVerificationToken(user.email);
        sendVerifyEmail(user.email, token);
        res.json({ message: 'Verification email resent successfully' });
    } catch (error) {
        console.error('Failed to resend verification email:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const sendVerifyEmail = async (email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.Email_User,
                pass: process.env.Email_Password
            }
        });

        const mailOptions = {
            from: process.env.Email_User,
            to: email, // Ensure that the 'email' parameter is correctly passed as the recipient's email address
            subject: 'Email Verification',
            text: `Please click the following link to verify your email: http://localhost:4200/verify-email?token=${token}`,
        };

        await transporter.sendMail(mailOptions);
       //console.log(process.env.CLIENT_URL)
        console.log('Verification email sent successfully.');
    } catch (error) {
        console.error('Failed to send verification email:', error.message);
        //throw new Error('Failed to send verification email');
    }
};

const dataUser = async (req, res) => {
    try {
        const data = await userModel.getUserByUserId();
        res.json(data);
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    dataUser,
    verifyEmail,
    resendverifyEmail,
    sendVerifyEmail,
};