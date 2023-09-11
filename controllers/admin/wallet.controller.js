const {Wallet} = require('../../models/wallet.model')
const {Member} = require('../../models/member.model');
const token_decode = require('../../lib/token_decode');
const user_data = require('../../lib/user_data');
const { NotifyMember } = require('../../models/member/notify.member.model');
const numberDigiFormat = require('../../lib/numberDigitFormat');
const Joi = require('joi');
const { WalletHistory } = require('../../models/wallet.history.model');
exports.getAll = async(req, res)=>{
    try{
        const wallet = await Wallet.find();
        if(wallet){
            return res.status(200).send({status: true, data: wallet});
        }else{
            return res.status(400).send({status: false, message: 'ดึงข้อมูลไม่สำเร็จ'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}
exports.getById = async(req, res)=>{
    try{
        const id = req.params.id;
        const wallet = await Wallet.findById(id);
        if(wallet){
            return res.status(200).send({status: true, data: wallet});
        }else{
            return res.status(400).send({status: false, message: 'ดึงข้อมูลไม่สำเร็จ'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

exports.confirm = async(req, res)=>{
    try{
        const id = req.params.id;
        const wallet = await Wallet.findById(id);
        if(!wallet){
            return res.status(400).send({status: false, message: 'ไม่พบข้อมูล'})
        }

        //ตรวจสอบสถานะ wallet ปัจจุบัน
        if(wallet.status !=='รอตรวจสอบ'){
            return res.status(400).send({status: false, message: 'รายการนี้ถูกดำเนินการไปเรียบร้อยแล้ว'})
        }
        const user = await user_data(req.headers['token']);
        if(user.status){
            const member = await Member.findById(wallet.mem_id);
            const new_wallet = member.wallet + (wallet.amount-wallet.charge);
            //update new member wallet
            await Member.findByIdAndUpdate(member._id,{wallet : new_wallet});
            //update wallet status
            await Wallet.findByIdAndUpdate(id,{status: 'สำเร็จ', emp: `${user.name}`})
            //เพิ่มในประวัติเงินเข้า-ออกกระเป๋า wallet history
            const data_history = {
                mem_id : member._id,
                name : `เติมเงิน ${numberDigiFormat(wallet.amount)} บาท`,
                type : 'เข้า',
                detail : `ค่าธรรมเนียม ${numberDigiFormat(wallet.charge)} บาท`,
                amount : wallet.amount  - wallet.charge,
            }
            await WalletHistory.create(data_history);
            console.log('amount ', numberDigiFormat(wallet.amount));
            //create notify of member
            const data_noti = {
                mem_id : member._id,
                topic : `เงินเข้ากระเป๋า ${numberDigiFormat(wallet.amount)} บาท`,
                detail : `รายการเงินเข้ากระเป๋าจำนวน ${numberDigiFormat(wallet.amount)} จากรายการอ้างอิงที่ ${wallet.invoice}`
            }
            await NotifyMember.create(data_noti);
            return res.status(200).send({status: true, message: 'ยืนยันการแจ้งเติมเงินเรียบร้อยแล้ว'})
        }else{
            return res.status(400).send({status: false, message: 'ไม่มีสิทธิ์ใช้งานระบบนี้'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

exports.cancel = async(req, res)=>{
    try{
        const id = req.params.id;
        const vali = (data)=>{
            const schema = Joi.object({
                detail : Joi.string().required().label('กรุณากรอกเหตุผลที่ยกเลิก')
            })
            return schema.validate(data);
        }
        const {error} = vali(req.body);
        if(error){
            return res.status(400).send({status: false, message: error.details[0].message})
        }
        const wallet = await Wallet.findById(id);
        if(wallet){
            //ตรวจสอบสถานะเพื่อทำรายการต่อ
            if(wallet.status !== 'รอตรวจสอบ'){
                return res.status(400).send({message: 'รายการนี้ถูกดำเนินการอย่างอื่นเรียบร้อย ไม่สามารถยกเลิกได้'})
            }
            const user = await user_data(req.headers['token']);
            
            //อัพเดตสถานะถูกยกเลิก
            await Wallet.findByIdAndUpdate(id, {status : 'ยกเลิก', emp:user.name})
            //แจ้งเตือนให้กับ member platform
            const data_noti = {
                mem_id : wallet.mem_id,
                topic : `แจ้งเติมเงินถูกยกเลิก (เลขที่ ${wallet.invoice})`,
                detail : `รายการถูกเลิกเนื่องจาก ${req.body.detail}`
            }
            await NotifyMember.create(data_noti);
            return res.status(200).send({message: 'ยกเลิกรายการแจ้งเติมเงินเรียบร้อยแล้ว'})
        }else{
            return res.status(400).send({message: 'ไม่พบรายการแจ้งเติมเงินรายการนี้'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}