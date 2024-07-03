const jwt = require('jsonwebtoken');
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

const refreshToken = (req, res, next) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.sendStatus(401);
  }

  jwt.verify(refreshToken, secret.RefreshToken, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }
    console.log('Access token is expired');
    const accessToken = jwt.sign({ username: decoded.username, userId: decoded.userId }, secret.Accesstoken, { expiresIn: '5m' });
    res.json({ accessToken });
  });
};

module.exports = { AuthToken, refreshToken };
