const mongoose = require('mongoose');
const Joi = require('joi');
const dayjs = require('dayjs')
const MoneyHistorySchema = new mongoose.Schema({
    mem_id : {type: String, required: true},
    name : {type: String, required: true},
    type : {type: String, required: true}, //เข้า และ ออก
    amount : {type: Number, required: true},    //ยอดที่ยังไม่ได้หักภาษี
    vat : {type: Number, required: true},       //ยอดภาษีจาก amount
    total : {type: Number, required: true},     //ยอดสุทธิ amount - vat
    detail : {type: String, required: false, default : '-'},
    timestamp : {type : Date, required: false, default : dayjs(Date.now()).format()}
}, {timestamps: true});

const MoneyHistory = mongoose.model('money_history', MoneyHistorySchema);

const validate = (data)=>{
    const schema = Joi.object({
        mem_id : Joi.string().required().label('ไม่พบไอดีผู้ใช้งาน'),
        name : Joi.string().required().label('ไม่พบหัวข้อ'),
        amount : Joi.number().required().label('ไม่พบจำนวน'),
        vat : Joi.number().required().label('ไม่พบยอดภาษี ณ ที่จ่าย'),
        total : Joi.number().required().label('ไม่พบยอดสุทธิ'),
        type : Joi.string().required().label('ไม่พบประเภทการทำรายการ'),
        detail : Joi.string().default('-'),
        timestamp: Joi.date().default(dayjs(Date.now()).format())
    })
    return schema.validate(data);
}

module.exports = {MoneyHistory, validate};