const jwt = require('jsonwebtoken');
const secret = process.env;

const AuthToken = (req, res,next) => {
    const Headerauth = req.headers['authorization'];
    const token = Headerauth && Headerauth.split(' ')[1];

    if(token==null) return res.sendStatus(401); //if not any token or expire

    try {
        const decoded = jwt.verify(token, secret.Accesstoken);
        // Check if token is expired
        if (decoded.exp > Date.now() / 1000) {
            return res.status(401).json({ error: 'Token expired' });
        }
        next();
    } catch(err) {
        return res.Status(403);
    }
    
};

module.exports = AuthToken;