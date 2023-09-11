//เก็บการแจ้งเตือนของผู้ใช้งาน

const mongoose = require('mongoose');
const Joi = require('joi');
const dayjs = require('dayjs');
const NotifyMemberSchema = new mongoose.Schema({
    mem_id : {type:String, required: true},
    topic : {type: String, required: true},
    detail : {type: String, required: false, default : '-'},
    status: {type: Boolean, required: false, default: false}, // false = no read, true = readed
    timestamp: {type: Date, required: false, default : new Date()}
})

const NotifyMember = mongoose.model('notify_member', NotifyMemberSchema);

const validate_notify = (data)=> {
    const schema = Joi.object({
        mem_id : Joi.string().required().label('ไม่พบ Member ID'),
        topic : Joi.string().required().label('ไม่พบหัวข้อแจ้งเตือน'),
        detail : Joi.string().default('-'),
        status: Joi.boolean().default(false),
        timestamp : Joi.date().default(new Date())
    })

    return schema.validate(data);
}

module.exports = {NotifyMember, validate_notify}