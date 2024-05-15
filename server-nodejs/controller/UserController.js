const userModel = require('../model/Usermodel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
//const date = new Date();

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await userModel.createUser(username, email, password);
        const token = tokenEmailVerificationGenerate(email);
        //sendVerifyEmail(email,token);
        //console.log(token);
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

        if (!user.user_verify) {
            return res.status(400).json({error: 'Email not verified. Please resend verification email.'});
        }

        const token = tokenUserGenerate(user);
        //console.log(`Token Generated at:- ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
        res.json({ user: String(user.email), token });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
const tokenUserGenerate = (user) => {
    return jwt.sign({user: user.username},process.env.Accesstoken,{expiresIn:"5m"});
}

const tokenEmailVerificationGenerate = (email) => {
    return jwt.sign({email},process.env.EmailVerificationToken,{expiresIn:"1h"});
}

const tokenExtensionsGenerate = (user) => {
    return jwt.sign({user: user.username},process.env.ExtensionsAccesstoken,{expiresIn:"5m"});
}

const verifyEmail = async (req,res) => {
    const { token } = req.body;

    if(!token){
        return res.status(400).json({ error: 'Token is missing' });
    }
    else{
        try{
            const decoded = jwt.verify(token,process.env.EmailVerificationToken)
            const {username, email} = decoded;
            const user = userModel.getUserEmail(email);
            if(user.user_verify){
                res.status(200).send("Email is already verified.");
            }
            else{
                await userModel.updateUserVerification(username,email)
                res.status(201).json({ message: 'Email verified successfully' });
            }
            
        }catch(error){
            if (error.name === 'TokenExpiredError') {
                const { email } = jwt.decode(token);
                const user = await userModel.getUserEmail(email);
                if(user.user_verify){
                    res.status(200).send("Email is already verified.");
                }
                else{
                    return res.status(401).json({ error: 'Token has expired' });
                }
                
            }
            else{
                console.error('Error verifying email:', error);
                res.status(500).json({ error: 'Internal Server Error', details: error.message });
            }
            
        }
    }
}

const sendVerifyEmail = async (req,res) => {
    const { email } = req.body;

    try {
        const user = await userModel.getUserEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.user_verify) {
            return res.status(400).json({ error: 'Email already verified' });
        }
        const token = tokenEmailVerificationGenerate(user.email);
        sendEmail(user.email, token);
        res.json({ message: 'Verification email resent successfully' });
    } catch (error) {
        console.error('Failed to resend verification email:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const sendEmail = async (email, token) => {
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
            text: `Please click the following link to verify your email: http://localhost:4200/verify-email?token=${token}&email=${email}`,
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
    sendVerifyEmail,
    sendEmail,
    tokenExtensionsGenerate,
};