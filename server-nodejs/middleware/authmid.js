const jwt = require('jsonwebtoken');
const UserModel = require('../model/Usermodel');
const secret = process.env;

const AuthToken = (req, res, next) => {
  const Headerauth = req.headers['authorization'];
  const token = Headerauth && Headerauth.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: 'Token needed to authenticate' });
  }

  // Verifying the JWT token 
  jwt.verify(token, secret.Accesstoken, function (err, decoded) {
    if (err) {
      return res.status(401).json({ error: 'Token expired' });
    } else {
      req.user = decoded;
      console.log("Token verified successfully");
      next();
    }
  });
};

const checkIsadmin = async (req, res, next) => {
  try {
    const userId = req.user.userId; // req.user จาก middleware ของ JWT (AuthToken)
    const user = await UserModel.findRoleById(userId);
    if (user && user.role === 'admin') {
      next(); // หากเป็น admin ให้ดำเนินการต่อ
    } else {
      return res.status(403).json({ message: 'Forbidden' }); // หากroleไม่ใช่ admin ให้ส่ง 403
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { AuthToken, checkIsadmin };
