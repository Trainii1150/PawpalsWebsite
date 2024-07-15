const userModel = require('../model/UserModel');
const ItemStorageModel = require('../model/ItemstorageModel');
const CoinsModel = require('../model/CoinsModel'); // Ensure this is imported
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.createUser(username, email, hashedPassword);
        res.json(username);
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
        res.json({ uid: String(user.user_id), accessToken, refreshToken });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

const checkEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const isTaken = await userModel.findbyEmail(email);
        res.json(!!isTaken);
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

const tokenresetpassEmailGenerate = (email) => {
    return jwt.sign({ email }, process.env.ResetpassEmailtoken, { expiresIn: "10m" });
}

const tokenEmailVerificationGenerate = (email) => {
    return jwt.sign({ email }, process.env.EmailVerificationToken, { expiresIn: "1h" });
}

const tokenExtensionsGenerate = (req, res) => {
    try {
        const email = req.body.email;
        const token = jwt.sign({ email }, process.env.ExtensionsAccesstoken, { expiresIn: "5m" });
        res.json({ token, email });
    } catch (error) {
        console.error('Error generating extension token:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const resetpasswordemail = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.getResetpassemail(email);
        if (!user) {
            return res.status(404).send('Email not found');
        }
        const token = tokenresetpassEmailGenerate(email);
        await sendresetEmail(email, token);
        res.json({ message: 'Verification email resent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const validateResetToken = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token is missing' });
    }
    try {
        jwt.verify(token, process.env.ResetpassEmailtoken);
        res.json({ message: 'Token is valid' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ error: 'Token has expired' });
        } else {
            res.status(500).json({ message: 'An error occurred' });
        }
    }
};

const checkOldPassword = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.getUserData(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        res.json(isPasswordMatch);
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const resetpassword = async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.updatePassword(hashedPassword, email);
        res.status(201).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token is missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.EmailVerificationToken);
        const { email } = decoded;
        const user = await userModel.getUserData(email);
        if (user.user_verify) {
            return res.status(403).send("Email is already verified.");
        }
        await userModel.updateUserVerification(email);
        res.status(201).json({ message: 'Email verified successfully' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const { email } = jwt.decode(token);
            const user = await userModel.getUserData(email);
            if (user.user_verify) {
                return res.status(403).send("Email is already verified.");
            }
            return res.status(401).json({ error: 'Token has expired' });
        }
        console.error('Error verifying email:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

const sendVerifyEmail = async (req, res) => {
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
        await sendEmail(user.email, token);
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
                <p>Hi, Form Pawpals</p>
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
        console.error('Failed to send reset password email:', error.message);
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
            to: email,
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
        console.log('Verification email sent successfully.');
    } catch (error) {
        console.error('Failed to send verification email:', error.message);
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

const buyItem = async (req, res) => {
    const { uid, item_id } = req.body;
  
    console.log('Buying item:', { uid, item_id });
  
    if (!uid || !item_id) {
      return res.status(400).json({ message: 'User ID and Item ID are required' });
    }
  
    try {
      const itemPrice = await ItemStorageModel.getItemPrice(item_id);
      await CoinsModel.deductUserCoins(uid, itemPrice);
  
      const existingItem = await ItemStorageModel.checkItemInStorageItem(uid, item_id);
      if (existingItem) {
        const updatedItem = await ItemStorageModel.updateStorageItem(existingItem.storage_id, uid, item_id, existingItem.quantity + 1);
        return res.status(200).json({ message: 'Item updated successfully' });
      } else {
        const newItem = await ItemStorageModel.createStorageItem(uid, item_id, 1);
        return res.status(201).json({ message: 'Item bought successfully' });
      }
    } catch (error) {
      console.error('Error buying item:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  };
  




const deleteItemfromStorage = async (req, res) => {
    const { storageId, userId, itemId } = req.body;
    try {
        const existingItem = await ItemStorageModel.checkItemInStorageItem(userId, itemId);
        if (!existingItem || existingItem.storage_id !== storageId) {
            return res.status(404).json({ message: 'Item not found in storage' });
        } else {
            await ItemStorageModel.deleteStorageItem(storageId, userId, itemId);
            return res.status(200).json({ message: 'Item deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
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
    buyItem,
    deleteItemfromStorage,
};
