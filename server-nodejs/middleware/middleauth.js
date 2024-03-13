const jwt = require('jsonwebtoken');
const secret = process.env;

const AuthToken = (req, res,next) => {
    const Headerauth = req.headers['authorization'];
    const token = Headerauth && Headerauth.split(' ')[1];

    if(token==null) return res.sendStatus(401); //if not any token or expired

    try{
        const decoded = jwt.verify(token, secret.Accesstoken);
        req.user =decoded;
        next();
    } catch(err){
        return res.sendStatus(403).json({errordsads});
    }
};

module.exports = AuthToken;