const userModel = require('../model/Usermodel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
//const date = new Date();

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.createUser(username, email, hashedPassword);
        /*  
            const user = await userModel.createUser(username, email, password);
            const token = tokenEmailVerificationGenerate(email);
            sendVerifyEmail(email,token);
            console.log(token);
            
        */res.json(username);
        //return res.status(200).send('User Email created successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.getUserData(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.user_verify) {
            return res.status(400).json({ error: 'Email not verified. Please resend verification email.' });
        }

        const { accessToken, refreshToken } = tokenUserGenerate(user);
        res.json({ uid: String(user.user_id), accessToken , refreshToken });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};


const checkEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const isTaken = await userModel.findbyEmail(email);
        // If the email is found, isTaken should be true, otherwise false
        const emailExists = isTaken ? true : false; 
        //console.log(emailExists);
        res.json(emailExists);
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const tokenUserGenerate = (user) => {
    const accessToken = jwt.sign({ username: user.username, userId: user.user_id }, process.env.Accesstoken, { expiresIn: '5m' });
    const refreshToken = jwt.sign({ username: user.username, userId: user.user_id }, process.env.RefreshToken, { expiresIn: '1d' });
    return { accessToken, refreshToken };
};

const tokenresetpassEmailGenerate = (email) =>{
    return jwt.sign({email},process.env.ResetpassEmailtoken,{expiresIn:"10m"});
}

const tokenEmailVerificationGenerate = (email) => {
    return jwt.sign({email},process.env.EmailVerificationToken,{expiresIn:"1h"});
}

const tokenExtensionsGenerate = (req, res) => {
    try {
        const email = req.body.email; // Extract email from request body
        const token = jwt.sign({ email },process.env.ExtensionsAccesstoken, { expiresIn: "5m" });
        res.json({ token ,email}); // Send the generated token as JSON response
    } catch (error) {
        console.error('Error generating extension token:', error);
        res.status(500).json({ error: 'Internal Server Error' });

    }
};

const resetpasswordemail = async (req, res) => {
    const {email} = req.body.email;
    //console.log(email);
    try {
        const user = await userModel.getResetpassemail(email);
        if(!user){
            return res.status(404).send('Email not found');
        }
        else{
            const token = tokenresetpassEmailGenerate(user);
            sendresetEmail(user.email, token);
            res.json({ message: 'Verification email resent successfully' });
        }
    } catch (error) {
        console.error(error);
    }

};

const validateResetToken = async (req, res) => {
    const { token } = req.body;
    if(!token){
        return res.status(400).json({ error: 'Token is missing' });
    }
    try {
      const isTokenValid = jwt.verify(token,process.env.ResetpassEmailtoken)
      res.json({ message: 'Token is valid' });
    } catch (error) {
        if (error.name === 'TokenExpiredError'){
            res.status(401).json({ error: 'Token has expired' });
        }
        else{
            res.status(500).json({ message: 'An error occurred' });
        }
    }
};

const checkOldPassword = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.getUserData(email);
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        // Compare the oldPassword with the hashed password stored in the database
        const IsPasswordMatch = await bcrypt.compare(password , user.password);
        const PasswordExists = IsPasswordMatch ? true : false;
        res.json(PasswordExists);

    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const resetpassword = async (req, res) => {
    const {email , password} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await userModel.updatePassword(hashedPassword, email);
        res.status(201).json({ message: 'Email Password has changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const verifyEmail = async (req,res) => {
    const { token } = req.body;

    if(!token){
        return res.status(400).json({ error: 'Token is missing' });
    }
    else{
        try{
            const decoded = jwt.verify(token,process.env.EmailVerificationToken)
            const {username, email} = decoded;
            const user = userModel.getUserData(email);
            if(user.user_verify){
                res.status(403).send("Email is already verified.");
                //res.status(200).send("Email is already verified.");
            }
            else{
                await userModel.updateUserVerification(username,email)
                res.status(201).json({ message: 'Email verified successfully' });
            }
            
        }catch(error){
            if (error.name === 'TokenExpiredError') {
                const { email } = jwt.decode(token);
                const user = await userModel.getUserData(email);
                if(user.user_verify){
                    res.status(403).send("Email is already verified.");
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
        const user = await userModel.getUserData(email);
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


const sendresetEmail = async (email, token) => {
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
            to: email,
            subject: 'Password Reset',
            html: `
                <p>Hi,Form Pawpals</p>
                <p>Forgot your password?</p>
                <p>We received a request to reset the password for your account.</p>
                <p>To reset your password, click on the button below:</p>
                <a href="http://localhost:4200/reset-password?token=${token}&email=${email}" style="display:inline-block;padding:10px 20px;font-size:16px;color:white;background-color:#007bff;border-radius:5px;text-decoration:none;">Reset password</a>
                <p>Or copy and paste the URL into your browser:</p>
                <p><a href="http://localhost:4200/reset-password?token=${token}&email=${email}">http://localhost:4200/reset-password?token=${token}&email=${email}</a></p>
                <p>This link will expire in 30 minutes.</p>
            `
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Failed to send resetpassword to email:', error.message);
    }
};

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
            html: `
            <p>Hi, Form Pawpals</p>
            <p>Thank you for signing up!</p>
            <p>Please verify your email address to activate your account.</p>
            <p>To verify your email, click on the button below:</p>
            <a href="http://localhost:4200/verify-email?token=${token}&email=${email}" style="display:inline-block;padding:10px 20px;font-size:16px;color:white;background-color:#007bff;border-radius:5px;text-decoration:none;">Verify Email</a>
            <p>Or copy and paste the URL into your browser:</p>
            <p><a href="http://localhost:4200/verify-email?token=${token}&email=${email}">http://localhost:4200/verify-email?token=${token}&email=${email}</a></p>
            `,
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
    resetpasswordemail,
    validateResetToken,
    checkOldPassword,
    resetpassword,
    checkEmail,
};