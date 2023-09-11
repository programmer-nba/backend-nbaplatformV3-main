const jwt = require('jsonwebtoken');
const CheckUserWallet = require('../../lib/checkwallet');
const { DebitWallet} = require('../../lib/transection/debit.wallet');
const { TempTrans } = require('../../models/temporaryTrans.model')

//STEP 0- get Mobile bill service
module.exports.GetMobileBillService = async (req,res) => {
    try {

        const axios = require('axios');
        const config = {
            method: 'GET',
            url:`${process.env.SHOP_API}/api/cs/mobile-bill`,
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN
            }
        }

        await axios(config).then(result=>{
            return res.status(200).send({message:"ดึงข้อมูล mobile bill service สำเร็จ",data:result.data});
        })
        .catch(error=>{
            return res.status(403).send({message:"ดึงข้อมูลไม่สำเร็จ",data:error.message});
        })
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:"Internal Server Error"});
    }
    
}

//START 1 - check
module.exports.Check = async (req,res)=>{
    try {

        const token = req.headers['token'];

        const decoded = jwt.verify(token,process.env.TOKEN_KEY);
    
        const userWallet = await CheckUserWallet(decoded._id);
            console.log(userWallet);
    
            const price = Number(req.body.price)
            if(userWallet < price || userWallet <=0){
                return res.status(403).send({message:'มีเงินไม่เพียงพอ'});
            }
            
        var axios = require('axios');
        const dataRequest = {
            productid:req.body.productid,
            mobile: req.body.mobile
        }
        const request = {
            method:'post',
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN,
            },
            url:`${process.env.SHOP_API}/counter_service/mobile_bill/check`,
            data:dataRequest
        } 
        await axios(request).then(response => {

                    return res.status(200).send({message:'เช็คข้อมูลสำเร็จ',data:response.data});
                })
                .catch(err=>{
                    return res.status(403).send({message:'เช็คข้อมูลไม่สำเร็จ',data:err})
                })
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:'Server error'});
    }
}

//STEP 2 - Recieved Transaction
module.exports.GetTransaction = async (req,res) => {
    try {
    const token = req.headers['token'];

    const decoded = jwt.verify(token,process.env.TOKEN_KEY);

    const userWallet = await CheckUserWallet(decoded._id);
        console.log(userWallet);

        if(userWallet < req.body.price){
            return res.status(403).send({message:'มีเงินไม่เพียงพอ'});
        }else{
            console.log(`${decoded._id} ต้องการทำรายการเติมเงินมือถือ`)
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
    url:`${process.env.SHOP_API}/counter_service/mobile_bill/verify`,
    data:data
}
await axios(request).then(async response => {
    console.log(response.data)

    //create tempolary transection
    const data = {
        transid: response.data.transid,
        price: Number(req.body.price),
        mobile: req.body.mobile,
        charge: response.data.charge,
        cost_nba: response.data.cost_nba,
        cost_shop: response.data.cost_shop
    }
    const tempTrans = new TempTrans(data);
    await tempTrans.save(err=>{
        console.log(err);
    })
    const DataResponse = {
        status: response.data.status,
    error_code: response.data.error_code,
    error_text: response.data.error_text,
    productid: response.data.productid,
    charge: response.data.charge,
    transid: response.data.transid,
    cost_nba : response.data.cost_nba,
    cost_shop : response.data.cost_shop,
    price: response.data.price
    }
    return res.status(200).send(DataResponse);
})
.catch(error=>{
    return res.status(403).send(error.message);
});

} catch (error) {
    console.error(error);
    return res.status(500).send({message:'มีบางอย่างผิดพลาด'});
        
}

}


//STEP 3 - Confirm
module.exports.Confirm = async (req,res) => {
    try {

        const Transid = req.body.transid

        const TempTransData = await TempTrans.findOne({ transid : Transid });

        // check user money
        const token = req.headers['token'];

        const decoded = jwt.verify(token,process.env.TOKEN_KEY);
    
        const userWallet = await CheckUserWallet(decoded._id);
            console.log(userWallet);

            const price = TempTransData.price
    
            if(userWallet < price){
                return res.status(403).send({message:'มีเงินไม่เพียงพอ'});
            }else{
                console.log(`${decoded._id} ต้องการทำราย mobile bill`)
            }


        const requestdata = {

            shop_id : req.user._id,
            mobile : TempTransData.mobile,
            detail : "",
            company : "NBA Platform",
            payment_type : "wallet",
            price : price,
            charge : TempTransData.charge,
            receive : price + TempTransData.charge,
            cost_nba : TempTransData.cost_nba,
            cost_shop : TempTransData.cost_shop,
            employee : "Platform-member",
            transid : TempTransData.transid,
            timestamp : new Date(),
            updated_by: "",
            created_by: "NBA-Platform"
 
        }

        console.log(requestdata);
    
    var axios = require('axios');

    const request = {
        method:'post',
        headers:{
            'auth-token':process.env.SHOP_API_TOKEN,
            'Content-Type': 'application/json'
        },
        url:`${process.env.SHOP_API}/counter_service/mobile_bill/confirm`,
        data:requestdata
    }

    await axios(request).then(async response => {
        //create wallet history

        console.log(response.data);
        const charge = 15;
       
        const debitAmount = Number(response.data.data.price) + charge
   
        const debitData = {
            mem_id:decoded._id,
            name:`service mobile topup ${response.data.invoice}`,
            type:"ออก",
            amount: debitAmount,
            detail: response.data.data.detail,
            timestamp: `${new Date()}`

        }

      const RemaindingWallet = await DebitWallet(token,debitData);

      //delete temporary transection
      const TempTransData = await TempTrans.findOneAndDelete({ transid: Transid })
      if (TempTransData) {
          res.status(200)
      }
      
      const DataResponse = {
        status:response.data.status,
        data:{
            serviceid:response.data.data.detail.productid,
            service_name:response.data.data.detail.productname,
            price:response.data.data.price,
            charge:response.data.data.charge,
            total:(Number(response.data.data.price)+Number(response.data.data.charge)),
            remainding_wallet:RemaindingWallet,
        }

      }
       
        return res.status(200).send(DataResponse);
    })
    .catch(error=>{
        console.error(error);
        return res.status(403).send({code:error.code,data:error.message});
    });
    
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:'มีบางอย่างผิดพลาด'});
            
    }
}
