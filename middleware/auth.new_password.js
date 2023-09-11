const jwt = require('jsonwebtoken');
const verifyToken = async (req, res, next)=>{
    const token = req.headers['token'];
    
    if(!token){
        console.log(token)
        return res.status(401).send({status: false, message: "Unauthorized"})
    }
    try{
        const decoded = jwt.verify(token, `${process.env.TOKEN_KEY}`);
        if(decoded){
            return next();
        }else{
            return res.status(403).send({status: false, message: "Unauthorized"})
        }
    }catch(err){
        return res.status(401).send({status: false, message: "Token Invalid"})
    }
}

module.exports = verifyToken;

