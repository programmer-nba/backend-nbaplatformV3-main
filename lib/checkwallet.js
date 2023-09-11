const {Member} = require('../models/member.model');

async function CheckUserWallet(userId){
    
    const user = await Member.findById(userId);
    
        const userWallet = user.wallet;

    return userWallet;
}

module.exports = CheckUserWallet;