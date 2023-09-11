const mongoose = require('mongoose');
const Joi = require('joi');

const UserSchema = new mongoose.Schema({
    name : {type: String, required: true},
    username : {type: String, required : true},
    password : {type: String, required: true},
    position : {type: String, required: true},
    status : {type: Boolean, required: false, default : true}
});

const User = mongoose.model('user', UserSchema);

const validate = (data)=>{
    const schema = Joi.object({
        name : Joi.string().required().label('ไม่พบชื่อผู้ใช้งาน'),
        username : Joi.string().regex(/^[a-z0-9]*$/,'').required().label('ชื่อผู้ใช้งานจะต้องเป็นภาษาอังกฤษพิมพ์เล็ก หรือ ตัวเลข 0-9 เท่านั้น'),
        password : Joi.string().required().label('ไม่พบรหัสผ่าน'),
        position : Joi.string().required().label('ไม่พบตำแหน่ง'),
        status : Joi.boolean().default(true)
    })
    return schema.validate(data);
}

module.exports = {User, validate};