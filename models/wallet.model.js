const mongoose = require('mongoose');
const Joi = require('joi');
const dayjs = require('dayjs');

const WalletSchema = new mongoose.Schema({
    invoice : {type: String, required: false, default: ''},
    mem_id : {type: String, required: true},
    type : {type: String, required : true},     //ช่องทางการเติม slip หรือ gbpay
    amount : {type: Number, required: true},
    charge : {type: Number, required: false, default: 0},
    status : {type: String, required: false, default: 'รอตรวจสอบ'},
    image : {type: String, required: false, default : ''},
    emp : {type: String, required: false, default: ''},     //เจ้าหน้าที่ที่ดำเนิการกรณีเป็น qrcode
    timestamp : {type: Date, required: false, default: new Date()}
}, {timestamps: true})

const Wallet = mongoose.model('wallet', WalletSchema);

const validate = (data)=>{
    const schema = Joi.object({
        invoice : Joi.string().default(''),
        mem_id : Joi.string().required().label('ไม่พบไอดีสมาชิกที่ทำรายการ'),
        type : Joi.string().required().label('ไม่พบประเภทการทำรายการ'),
        amount : Joi.number().required().label('ไม่พบจำนวนที่ต้องการเติม'),
        charge : Joi.number().default(0),
        status: Joi.string().default('รอตรวจสอบ'),
        image: Joi.string().default(''),
        emp : Joi.string().default(''),
        timestamp : Joi.date().default(new Date())
    })
    return schema.validate(data);
}
module.exports = {Wallet, validate}