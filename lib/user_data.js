const { User } = require("../models/admin/user.model");
const token_decode = require("./token_decode");


const user_data = async (token)=>{
    const decoded = token_decode(token);
    const user = await User.findById(decoded._id);
    if(user){
        return user;
    }else{
        return false;
    }
}

module.exports = user_data;