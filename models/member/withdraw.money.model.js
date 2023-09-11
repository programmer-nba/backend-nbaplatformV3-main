const mongoose = require('mongoose');
const Joi = require('joi');
const dayjs = require('dayjs');

const WithdrawMoneySchema = new mongoose.Schema({
    mem_id : {type:String, required: true},
    ref : {type: String,required: true},
    amount : {type:Number, required : true},
    charge : {type:Number, required : true},
    total : {type: Number, required : true},
    image : {type:String, required: false, default: ''},
    emp : {type: String, required: false, default: ''},
    status: {type: String, required: false, default: 'รอดำเนินการ'},
},{timestamps : true});

const WithdrawMoney = mongoose.model('withdraw_money', WithdrawMoneySchema);

const validate_withdraw = (data)=>{
    const schema = Joi.object({
        mem_id : Joi.string().required().label('ไม่พบ member id'),
        ref : Joi.string().required().label('ไม่พบเลขอ้างอิง'),
        amount : Joi.number().required().label('ไม่พบ ยอด amount'),
        charge : Joi.number().required().label('ไม่พบค่าธรรมเนียม'),
        total : Joi.number().required().label('ไม่พบยอดรวม'),
        image : Joi.string().default(''),
        emp : Joi.string().default(''),
        status: Joi.string().default('รอดำเนินการ'),
    });
    return schema.validate(data);
}

module.exports = {WithdrawMoney, validate_withdraw}