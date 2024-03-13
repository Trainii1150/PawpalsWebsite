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
            next();
            console.log("Token verifified successfully");
        }
    });
    
};

module.exports = AuthToken;