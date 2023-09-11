const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next)=>{
    const token = req.headers['token'];
    if(!token){
        return res.status(401).send({status: false, message: "Unauthorized"})
    }
    try{
        const decoded = jwt.verify(token, `${process.env.TOKEN_KEY}`);
        if(decoded.auth!=='public'){
            return res.status(403).send({status: false, message: 'ไม่มีสิทธิเข้าถึง'});
        }else{
            return next();
        }
    }catch(err){
        console.log(err);
        return res.status(401).send({status: false, message: "Unauthorized"})
    }

}

module.exports = verifyToken;