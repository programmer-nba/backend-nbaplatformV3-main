const jwt = require('jsonwebtoken');
const CheckUserWallet = require('../../lib/checkwallet');
const { DebitWallet} = require('../../lib/transection/debit.wallet');
const { TempTrans } = require('../../models/temporaryTrans.model')

//STEP 0- get Mobile topup service
module.exports.GetCardTopup = async (req,res) => {
    try {

        const axios = require('axios');
        const config = {
            method: 'GET',
            url:`${process.env.SHOP_API}/api/cs/card-topup`,
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN
            }
        }

        await axios(config).then(result=>{
            return res.status(200).send({message:"ดึงข้อมูล card topup สำเร็จ",data:result.data});
        })
        .catch(error=>{
            return res.status(403).send({message:"ดึงข้อมูลไม่สำเร็จ",data:error.message});
        })
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:"Internal Server Error"});
    }
    
}

//STOP 1 - Check
module.exports.Check = async (req,res) => {
    try {

        //check user wallet
        const token = req.headers['token'];

    const decoded = jwt.verify(token,process.env.TOKEN_KEY);

    const userWallet = await CheckUserWallet(decoded._id);
        console.log(userWallet);
        const price = Number(req.body.price);
        
        if(userWallet < price){
            return res.status(403).send({message:'มีเงินไม่เพียงพอ'});
        }else{
            console.log(`${decoded._id} ต้องการทำรายการเติมบัตร`)
        }

    const data = {
        mobile : req.body.mobile,
        price: req.body.price,
        productid: req.body.productid

    }

var axios = require('axios');
const request = {
    method:'post',
    headers:{
        'auth-token':process.env.SHOP_API_TOKEN,
    },
    url:`${process.env.SHOP_API}/counter_service/card_topup/verify`,
    data:data
}


await axios(request).then(async (response) => {

    //create tempolary transection
    const data = {
        transid: response.data.transid,
        price: Number(req.body.price),
        mobile: req.body.mobile
    }
     const tempTrans = new TempTrans(data);
     await tempTrans.save(err=>{
        console.log(err);
     })

    return res.status(200).send(response.data);
})
.catch(error=>{
    return res.status(403).send(error.message);
});

} catch (error) { 
    console.error(error);
    return res.status(500).send({message:'มีบางอย่างผิดพลาด'});
        
}

}

//STEP 2 - Confirm
module.exports.Confirm = async (req,res) => {
 
    try {

        const Transid = req.body.transid

        const TempTransData = await TempTrans.findOne({ transid : Transid });

        // check user money
        const token = req.headers['token'];
        
        const decoded = jwt.verify(token,process.env.TOKEN_KEY);
        
        const userWallet = await CheckUserWallet(decoded._id);
        console.log(userWallet);
        
        const price = TempTransData.price;
       
               if(userWallet < price){
                   return res.status(403).send({message:'มีเงินไม่เพียงพอ'});
               }else{
                   console.log(`${decoded._id} ต้องการคอนเฟิร์มทำรายการเติมบัตร`)
               }
   
        const cost = price - (price*2/100);
        const profit_nba = price*1/100;
        const profit_shop = 0;

        const requestdata = {

        shop_id : decoded._id,
        payment_type : 'wallet',
        type: "บัตรเติมเงิน",
        mobile : TempTransData.mobile,
        price : price,
        charge: 0,
        receive : cost,
        profit_nba : profit_nba,
        profit_shop : profit_shop,
        cost : cost,
        employee : 'Platform-member',
        transid : TempTransData.transid,
        timestamp: `${new Date()}`
 
 
        }

    
    var axios = require('axios');
    const request = {
        method:'post',
        headers:{
            'auth-token':process.env.SHOP_API_TOKEN,
            'Content-Type': 'application/json'
        },
        url:`${process.env.SHOP_API}/counter_service/card_topup/confirm`,
        data:requestdata
    }
    await axios(request).then(async (response) => {

console.log(response)

        if(response.data.data.detail.error_code !=='E00'){
            return res.status(403).send({code:response.data.data.detail.error_code,data:response.data.data.detail});
        }else{

            const debitAmount = response.data.data.cost;

            const debitData = {
                mem_id:decoded._id,
                name:`service card topup ${response.data.data.invoice}`,
                type:"ออก",
                amount: debitAmount,
                detail: response.data.data.detail,
                timestamp: `${new Date()}`
    
            }

            //get user remainding wallet;
            const RemaindingWallet = await DebitWallet(token,debitData);

            //delete temporary transection
            const TempTransData = await TempTrans.findOneAndDelete({ transid: Transid })
                if (TempTransData) {
                    res.status(200)
                }

            return res.status(200).send({
                status:true,
                data:{
                    serviceid:response.data.data.detail.productid,
                    service_name:response.data.data.detail.productname,
                    price:response.data.data.detail.price,
                    discount:response.data.data.price*2/100,
                    debit:response.data.data.cost,
                    remainding_wallet: RemaindingWallet,
                }});
        }
    })
    .catch(error=>{
        return res.status(403).send({code:error.code,data:error.message});
    });
    
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:'มีบางอย่างผิดพลาด'});
            
    }
}
