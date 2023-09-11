const mongoose = require('mongoose');
const Joi = require('joi');

const TokenListSchema = new mongoose.Schema({
    mem_id : {type:String, required: true},
    token : {type: String, required: true},
    timestamp: {type: Date, required: true}
}, {timestamps: true})

const TokenList = mongoose.model('token_list', TokenListSchema);

const validate = (data)=>{
    const schema = Joi.object({
        mem_id : Joi.string().required().label('ไม่พบไอดีผู้ใช้งาน'),
        token : Joi.string().required().label('ไม่พบ token'),
        timestamp : Joi.string().required().label('ไม่พบวันเวลาที่ทำการ')
    })
    return schema.validate(data);
}

module.exports = {TokenList , validate};