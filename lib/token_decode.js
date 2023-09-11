const jwt = require('jsonwebtoken');

const token_decode = (token)=>{
    const decoded = jwt.verify(token, `${process.env.TOKEN_KEY}`);
    return decoded;
}

module.exports = token_decode;



