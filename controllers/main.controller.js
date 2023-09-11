const {Member, validate } = require('../models/member.model');
const Joi = require('joi');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const token_decode = require('../lib/token_decode');
const { TokenList } = require('../models/token.list.model');
const dayjs = require('dayjs');
const { LoginHistory } = require('../models/login.history.model');
const { MoneyHistory } = require('../models/money.history.model');


//Validate Register
const vali_register = (data)=>{
    const schema = Joi.object({
        ref_tel : Joi.string().default(''),
        name : Joi.string().required().label('กรุณากรอกชื่อ-นามสกุล'),
        tel : Joi.string().required().label('กรุณากรอกเบอร์โทร'),
        password : Joi.string().required().label('กรุณากรอกรหัสผ่าน'),
        address : Joi.string().required().label('กรุณากรอกที่อยู่'),
        subdistrict : Joi.string().required().label('กรุณากรอกเขต/ตำบล'),
        district : Joi.string().required().label('กรุณากรอกเขต/อำเภอ'),
        province : Joi.string().required().label('กรุณากรอกจังหวัด'),
        postcode : Joi.string().required().label('กรุณากรอกรหัสไปรษณีย์'),
        partner_group:Joi.string(),
        partner_shop_name:Joi.string(),
        partner_shop_address:Joi.string(),
        timestamp : Joi.string().required().label('ไม่พบเวลาที่สมัคร'),
        money : Joi.number().default(0)
    })
    return schema.validate(data);
}

//สมัครสมาชิก
exports.register = async(req, res)=>{
    try{
        const {error} = vali_register(req.body);
        if(error){
            return res.status(400).send({status: false, message: error.details[0].message});
        }
        //ตรวจสอบเบอร์โทร
        const checkTel = await Member.findOne({tel: req.body.tel});
        if(checkTel){
            return res.status(400).send({status: false, message: 'เบอร์โทรศัพท์เป็นสมาชิกอยู่แล้ว'})
        }
        let data = null;
        let first_money = 0; //มีเบอร์คนแนะนำจะคนสมัครจะได้รับทันที 15 บาท
        const card_number = `888888${req.body.tel}`
        const encrytedPassword = await bcrypt.hash(req.body.password, 10);
        if(req.body.ref_tel){
            console.log('มีเบอร์โทรคนแนะนำ')
            const memberRef = await Member.findOne({tel : req.body.ref_tel});
            if(memberRef){
                const upline = {
                    lv1 : memberRef._id,
                    lv2 : memberRef.upline.lv1,
                    lv3 : memberRef.upline.lv2
                }
                first_money = 0 //ยังไม่ให้เงินเริ่มต้น
                data = {...req.body,money: first_money-((first_money*7)/100), card_number:card_number, password: encrytedPassword, upline : upline}
                
            }else{
                return res.status(400).send({status: false, message: 'ไม่พบข้อมูลผู้แนะนำเบอร์โทรที่แนะนำนี้'})
            }
        }else{
            data = {...req.body,card_number:card_number, password : encrytedPassword}
            console.log('ไม่มีคนแนะนำ')
        }
        //เพิ่มข้อมูลลงฐานข้อมูล
        const member = await Member.create(data);
        if(member){
            if(first_money!==0){
                const money_history = {
                    mem_id : member._id,
                    name : 'ค่าตอบแทนการสมัคร (เมื่อมีผู้แนะนำ)',
                    type : 'เข้า',
                    amount : first_money,
                    vat : (first_money*7)/100,
                    total : first_money-((first_money*7)/100),
                    detail : 'รับค่าตอบแทนทันที เมื่อสมัครโดยมีเบอร์ผู้แนะนำ'
                }
                await MoneyHistory.create(money_history);
            }
            const token = jwt.sign({_id : member._id, auth: 'member'},`${process.env.TOKEN_KEY}`);
            await LoginHistory.create({mem_id: member._id, ip_address: 'register', timestamp: dayjs(Date.now()).format()})
            await TokenList.create({mem_id: member._id, token: token, timestamp: dayjs(Date.now()).format()})
            res.status(200).send({status: true, token : token});
        }else{
            return res.status(400).send({status: false, message: 'สมัครสมาชิกไม่สำเร็จ'})
        }
    }catch(err){
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

//เข้าสู่ระบบ
exports.login = async(req, res)=>{
    try{
        const {tel ,password, ip_address} = req.body;
        if(!ip_address){
            return res.status(400).send({status: false,message: 'ข้อมูลไม่ครบถ้วน'})
        }
        const member = await Member.findOne({tel});
        if(member && (await bcrypt.compare(password, member.password))){
            console.log('เข้าสู่ระบบสำเร็จ');
            
            const payload = {
                _id:member._id,
                 auth: 'member',
                 name:member.name,
                 tel:member.tel

            }

            const token = jwt.sign(payload, `${process.env.TOKEN_KEY}`)
            await LoginHistory.create({mem_id: member._id, ip_address: ip_address, timestamp: dayjs(Date.now()).format()})
            await TokenList.create({mem_id: member._id, token: token, timestamp: dayjs(Date.now()).format()})
            return res.status(200).send({status: true, token : token});
        }else{
            return res.status(400).send({message: 'เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

exports.logout = async (req, res)=>{
    try{
        const token = token_decode(req.headers['token']);
        const logout = await TokenList.deleteMany({mem_id: token._id});
        if(logout){
            return res.status(200).send({status: true, message: 'ออกจากระบบสำเร็จ'});
        }else{
            return res.status(400).send({status: false, message : 'ออกจากระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

//เรียกข้อมูลมูลผู้ใช้
exports.me = async(req,res)=>{
    try{
        const token = token_decode(req.headers['token']);
        const member = await Member.findById(token._id);
        if(member){
            return res.status(200).send({status: true, data:member});
        }else{
            return res.status(400).send({status: false, message: 'ไม่พบข้อมูลผู้ใช้นี้'});
        }
    }catch(err){
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}



//แก้ไขหรือตั้งรหัสผ่านใหม่
exports.setPassword = async(req, res)=>{
    try{
        const vali = (data)=>{
            const schema = Joi.object({
                password : Joi.string().required().label('ไม่พบรหัสผ่านใหม่')
            })
            return schema.validate(data);
        }
        const {error} = vali(req.body);
        if(error){
            return res.status(400).send({status: false, message : error.details[0].message})
        }
        const decode = token_decode(req.headers['token']);
        const encrytedPassword = await bcrypt.hash(req.body.password, 10);
        const change_password = await Member.findByIdAndUpdate(decode._id, {password:encrytedPassword})
        if(change_password){
            return res.status(200).send({status: true, message: 'ทำการเปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว'})
        }else{
            return res.status(400).send({status: false, message: 'เปลี่ยนรหัสผ่านไม่สำเร็จ'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

//genarate public token key
exports.genPublicToken = async(req, res)=>{
    try{
        const token = jwt.sign({code: 'nbadigital', name : 'NBA Digital Service', auth: 'public'}, process.env.TOKEN_KEY);
        if(token){
            return res.status(200).send({status: true, token : token})
        }else{
            return res.status(400).send({status: false, message: 'สร้าง Token ไม่สำเร็จ'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}