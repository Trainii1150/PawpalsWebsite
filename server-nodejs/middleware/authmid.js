const jwt = require('jsonwebtoken');
const secret = process.env;
//const date = new Date();

const AuthToken = (req, res,next) => {
    const Headerauth = req.headers['authorization'];
    const token = Headerauth && Headerauth.split(' ')[1];
    
    if(token==null) return res.sendStatus(401).json({ error: 'Token need to auth' }); //if not any token or expire
    
    
    // Verifying the JWT token 
    jwt.verify(token, secret.Accesstoken, function(err, decoded) {
        if (err) {
            //console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
            return res.status(401).json({ error: 'Token expired' });
        }
        else {
            //console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
            req.user = decoded;
            next();
            console.log("Token verifified successfully");
            
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
      console.log('acc token is expired');
      // Optionally, check if decoded data is valid for refresh
      const accessToken = jwt.sign({ username: decoded.username, userId: decoded.userId }, process.env.Accesstoken, { expiresIn: '5m' });
      res.json({ accessToken });
      //next();
    });
};

  module.exports = { AuthToken, refreshToken };