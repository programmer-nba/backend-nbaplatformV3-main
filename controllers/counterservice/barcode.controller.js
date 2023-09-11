const jwt = require('jsonwebtoken');
const CheckUserWallet = require('../../lib/checkwallet');
const { DebitWallet} = require('../../lib/transection/debit.wallet');
const { BarcodeCheck } = require('../../models/barcodeCheck.model')
const { TempTrans } = require('../../models/temporaryTrans.model')

//STEP 0- get Barcode service
module.exports.GetBarcodeService = async (req,res) => {
    try {

        const axios = require('axios');
        const config = {
            method: 'GET',
            url:`${process.env.SHOP_API}/api/cs/barcode-service`,
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN
            }
        }

        await axios(config).then(result=>{
            return res.status(200).send({message:"ดึงข้อมูล barcode-service สำเร็จ",data:result.data});
        })
        .catch(error=>{
            return res.status(403).send({message:"ดึงข้อมูลไม่สำเร็จ",data:error.message});
        })
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:"Internal Server Error"});
    }
    
}

//STEP 1 - Check
module.exports.Check = async (req,res) => {
    console.log('check')
    try {
        const axios = require('axios');
        const requestdata = {
            mobile:req.body.mobile,
            barcode:req.body.barcode
        }

        console.log(requestdata)
        const request = {
            method:'post',
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url:`${process.env.SHOP_API}/counter_service/barcode/check`,
            data:requestdata
        }

        await axios(request).then(async (response) => {
            
            //check barcode status
            console.log('data',response.data)
            const barcodeData = await BarcodeCheck.findOne({ barcode: req.body.barcode });
            if (barcodeData && barcodeData.status === 'barcode ไม่สามารถใช้งานได้') {
                return res.status(400).send({ message: 'Barcode ไม่สามารถใช้งานได้' });
            }

            //create barcode data collector
            const data = {
                productid: response.data.productid,
                barcode: req.body.barcode,
                mobile: req.body.mobile,
                price: Number(response.data.amount),
                data1: response.data.data_value[0],
                data2: response.data.data_value[1],
                data3: response.data.data_value[2],
                data4: response.data.data_value[3],
                data5: response.data.data_value[4]
            }
            console.log(data)
            const barcodeCheck = new BarcodeCheck(data);
            barcodeCheck.save(err=>{
                if (err) {
                console.log(err);
                }
            })

            return res.status(200).send(response.data);
        })
        .catch(error => {
            console.error(error);
            return res.status(400).send({message:error.message,data:'ไม่สามารถชำระได้'});
        })
        
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:"Internal Server Error"});
    }
}

//STEP 2 - Verification
module.exports.Verify = async (req,res) => {
    try {

        const data5 = req.body.data5

        const barcodeData = await BarcodeCheck.findOne({ data5 : data5 });

        const token = req.headers['token'];
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        const userWallet = await CheckUserWallet(decoded._id);

        if(userWallet < req.body.price){
            return res.status(403).send({message:"มีเงินไม่เพียงพอ"})
        }

        const axios = require('axios');
        const requestdata = {
            productid : barcodeData.productid,
            mobile : req.body.mobile,
            price : barcodeData.price,
            data1 : barcodeData.data1, 
            data2 : barcodeData.data2,
            data3 : barcodeData.data3,
            data4 : barcodeData.data4,
            data5 : req.body.data5
        }
        const request = {
            method:'post',
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url:`${process.env.SHOP_API}/counter_service/barcode/verify`,
            data:requestdata
        }

        await axios(request).then(async response => {

            //create tempolary transection
            const data = {
                transid: response.data.transid,
                price: barcodeData.price,
                mobile: req.body.mobile
            }

            const tempTrans = new TempTrans(data);
                  tempTrans.save(err=>{
                console.log(err);
            })

            barcodeData.transid = response.data.transid
            await barcodeData.save();

            const price = barcodeData.price

            if(userWallet < price){
                return res.status(403).send({message:"มีเงินไม่เพียงพอ"})
            }else{

                return res.status(200).send(response.data);
            }
        })
        .catch(error => {
            console.error(error)
            return res.status(400).send(error.message);
        })
    } catch (error) {
        console.error(error);
        return res.status(500).send({message:"Internal Server Error"});
    }
}

module.exports.Confirm = async (req,res) => {
    try {

        const Transid = req.body.transid

        const TempTransData = await TempTrans.findOne({ transid : Transid });

        const token = req.headers['token'];
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        const userWallet = await CheckUserWallet(decoded._id);

        const price = TempTransData.price

        if(userWallet < price){
            return res.status(403).send({message:"มีเงินไม่เพียงพอ"})
        }

        const axios = require('axios');

        const debitValue = price + 15
        const requestdata = {
            
                shop_id : decoded._id,
                mobile : TempTransData.mobile,
                price : TempTransData.price,
                charge: 15,
                receive: debitValue,
                payment_type : 'wallet',
                transid: TempTransData.transid,
                cost_nba: 0,
                cost_shop: 0,
                employee : 'Platform-member',
                status : [
                    {
                        name : "ทำรายการ",
                        timestamp : new Date()
                    }
                ],
                timestamp : new Date()
            
        }
        const request = {
            method:'post',
            headers:{
                'auth-token':process.env.SHOP_API_TOKEN,
                'Content-Type': 'application/json'
            },
            url:`${process.env.SHOP_API}/counter_service/barcode/confirm`,
            data:requestdata
        }

        await axios(request).then(async (response) => {

            if (process.env.SERVICE === "production") {
                
                const barcodeData = await BarcodeCheck.findOne({ transid: TempTransData.transid });
                if (barcodeData) {
                barcodeData.status = 'barcode ไม่สามารถใช้งานได้';
                await barcodeData.save();
                } else {
                console.log("ไม่สามาถค้นหา:", TempTransData.transid);
                }
            }

            if(response){

                console.log(response.data.data)

                const NbaCharge = 5; // charge 5 บาท
                const charge =  Number(response.data.data.detail.charge) + Number(response.data.data.detail.charge2) + NbaCharge
                const debitAmount = charge + Number(response.data.data.detail.price);
    
                const debitData = {
                    mem_id:decoded._id,
                    name:`service barcode ${response.data.data.invoice}`,
                    type:"ออก",
                    amount: debitAmount,
                    detail: response.data.data,
                    timestamp: `${new Date()}`
        
                }
                
                await DebitWallet(token,debitData)

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
                        price:Number(response.data.data.detail.price),
                        charge:charge,
                        total:charge+Number(response.data.data.detail.price),
                        remainding_wallet : userWallet - debitAmount
                    }
                });
            }
        }).catch(error => {
            return res.status(400).send(error.message);
        })

    } catch (error) {
        console.error(error);
        return res.status(500).send({message:"Internal Server Error"});
    }
}