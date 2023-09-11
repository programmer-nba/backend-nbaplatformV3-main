const { default: axios } = require("axios");
const Joi = require("joi");
const { Member } = require("../../models/member.model");
const jwt = require("jsonwebtoken");

exports.verify = async(req, res)=>{
    try{
        const vali = (data)=>{
            const schema = Joi.object({
                phone : Joi.string().required().label('ไม่พบเบอร์โทร')
            })
            return schema.validate(data);
        }

        const {error} = vali(req.body);
        if(error){
            return res.status(400).send({status: false, message: error.details[0].message})
        }

        const config = {
            method: 'post',
            url: `${process.env.SMS_URL}/otp-send`,
            headers: {
                "Content-Type":"application/json",
                "api_key":`${process.env.SMS_API_KEY}`,
                "secret_key":`${process.env.SMS_SECRET_KEY}`,
            },
            data:JSON.stringify({
                "project_key":`${process.env.SMS_PROJECT_OTP}`,
                "phone":`${req.body.phone}`,
            })
        };
        await axios(config).then((result)=>{
            if(result.data.code==='000'){
                return res.status(200).send({status: true, result: result.data.result})
            }else{
                return res.status(400).send({status:false, ...result.data})
            }
        }).catch((err)=>{
            console.log(err);
            return res.status(400).send(err);
        })
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

exports.check = async(req, res)=>{
    try{
        const vali = (data)=>{
            const schema = Joi.object({
                otp_code: Joi.string().required().label('ไม่พบ otp_code'),
                token : Joi.string().required().label('ไม่พบ token') 
            })
            return schema.validate(data);
        }
        const {error} = vali(req.body);
        if(error){
            return res.status(400).send({status: false, message: error.details[0].message})
        }
        const config = {
            method: 'post',
            url: 'https://portal-otp.smsmkt.com/api/otp-validate',
            headers: {
                "Content-Type":"application/json",
                "api_key":`${process.env.SMS_API_KEY}`,
                "secret_key":`${process.env.SMS_SECRET_KEY}`,
            },
            data:JSON.stringify({
                "token":`${req.body.token}`,
                "otp_code":`${req.body.otp_code}`,
            })
        };
        await axios(config).then(function (response) {
            console.log(response.data);
            //หมดอายุ
            if(response.data.code==='5000'){
                return res.status(400).send({status: false, message: 'OTP นี้หมดอายุแล้ว กรุณาทำรายการใหม่'})
            }

            if(response.data.code==='000'){
                 //ตรวจสอบ OTP
                 if(response.data.result.status){
                    return res.status(200).send({status: true, message: 'ยืนยัน OTP สำเร็จ'})
                 }else{
                    return res.status(400).send({status: false, message: 'รหัส OTP ไม่ถูกต้องกรุณาตรวจสอบอีกครั้ง'})
                 }
            }else{
                return res.status(400).send({status: false,...response.data})
            }


        }).catch(function (error) {
            console.log(error);
            return res.status(400).send({status: false, ...error})
        });


    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

//ลืมรหัสผ่าน ตรวจสอบ sms otp สำหรับเพื่อแก้ไขรหัสผ่าน
exports.checkForgotPassword = async(req, res)=>{
    try{
        const vali = (data)=>{
            const schema = Joi.object({
                otp_code: Joi.string().required().label('ไม่พบ otp_code'),
                token : Joi.string().required().label('ไม่พบ token'),
                tel : Joi.string().required().label('ไม่พบเบอร์โทร')
            })
            return schema.validate(data);
        }
        const {error} = vali(req.body);
        if(error){
            return res.status(400).send({status: false, message : error.details[0].message})
        }
        const config = {
            method: 'post',
            url: 'https://portal-otp.smsmkt.com/api/otp-validate',
            headers: {
                "Content-Type":"application/json",
                "api_key":`${process.env.SMS_API_KEY}`,
                "secret_key":`${process.env.SMS_SECRET_KEY}`,
            },
            data:JSON.stringify({
                "token":`${req.body.token}`,
                "otp_code":`${req.body.otp_code}`,
            })
        };
        await axios(config).then(async function (response) {
            console.log(response.data);
            //หมดอายุ
            if(response.data.code==='5000'){
                return res.status(400).send({status: false, message: 'OTP นี้หมดอายุแล้ว กรุณาทำรายการใหม่'})
            }

            if(response.data.code==='000'){
                 //ตรวจสอบ OTP
                 if(response.data.result.status){
                    const member =  await Member.findOne({tel: req.body.tel});
                    if(member){
                        console.log('ยืนยันสำเร็จ')
                        const token = jwt.sign({_id:member._id},`${process.env.TOKEN_KEY}`,{expiresIn : '10m'})
                        return res.status(200).send({status: true, message: 'ยืนยัน OTP สำเร็จ', token : token})
                    }else{
                        console.log('ยืนยันไม่สำเร็จ')
                        return res.status(200).send({status: false, message: 'ไม่พบเบอร์โทรนี้ในระบบ'})
                    }
                    
                 }else{
                    return res.status(400).send({status: false, message: 'รหัส OTP ไม่ถูกต้องกรุณาตรวจสอบอีกครั้ง'})
                 }
            }else{
                return res.status(400).send({status: false,...response.data})
            }

        }).catch(function (error) {
            console.log(error);
            return res.status(400).send({status: false, ...error})
        });

    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}