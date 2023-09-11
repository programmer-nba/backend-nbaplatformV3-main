const jwt = require("jsonwebtoken");
const {WalletHistory} = require("../../models/wallet.history.model");
const {Member} = require("../../models/member.model");
const {ErrorLog} = require("../../models/error.log");

async function DebitWallet(token, debitData) {

  return new Promise(async (resolve, reject) => {

    if (!token) {
      console.log("cant' debit without acess token");
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);

      const member = await Member.findById(decoded._id);

      if (!member) {
        console.log("member not found");
        return;
      } else {
        console.log('current member wallet',member.wallet);
        
        const historyData = {
          mem_id: decoded._id,
          name: debitData.name,
          type: debitData.type,
          amount: debitData.amount,
          detail: debitData.detail,
        };

        const history = new WalletHistory(historyData);
        history.save(async (error) => {
          if (error) {
            console.log(error);
          } else {
            const remaindingWallet = member.wallet - debitData.amount;
        
            Member.findByIdAndUpdate(
              decoded._id,{wallet: remaindingWallet},{returnDocument:'after'},
              async (error, response) => {
                if (error) {
                  console.log(error);
                  const errorlog = new ErrorLog(error);
                  await errorlog.save();

                } else {
                  console.log('member reminding wallet:', response.wallet);
                  resolve(remaindingWallet)
                }
              }
            );
          }
        });
      }
    } catch (error) {
      console.log(error)
      reject(error)
    }
  })

}

module.exports = {DebitWallet};
