const mongoose = require('mongoose');
const Joi = require('joi');

const LoginHistorySchema = new mongoose.Schema({
    mem_id : {type: String, required: true},
    ip_address: {type: String, required: true},
    timestamp : {type: Date, required: true}
}, {timestamps: true});

const LoginHistory = mongoose.model('login_history', LoginHistorySchema);

const validate = (data)=>{
    const schema = Joi.object({
        mem_id : Joi.string().required().label('ไม่พบไอดีผู้ใช้งาน'),
        ip_address : Joi.string().required().label('ไม่พบไอพี'),
        timestamp : Joi.date().required().label('ไม่พบเวลาใช้งาน')
    });
    return schema.validate(data);
}

module.exports = {LoginHistory ,validate}