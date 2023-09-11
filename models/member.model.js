const mongoose = require('mongoose');
const Joi = require('joi');

const MemberSchema = new mongoose.Schema({
    card_number : {type: String, required: true},
    name : {type: String, required: true},
    tel : {type: String, required: true},
    password: {type: String, required: true},
    address : {type: String, required: true},
    subdistrict: {type: String, required: true},
    district : {type: String, required: true},
    province : {type: String, required: true},
    postcode : {type: String, required: true},
    partner_group:{type:String},
    partner_shop_name:{type:String},
    partner_shop_address:{type:String},
    allsale : {type: Number, required: false, default: 0},  //ยอดสะสมจากยอดขาย
    wallet : {type: Number ,required: false, default: 0},   //ยอดเงินในกระเป๋าอิเล็กทรอนิกส์
    money : {type: Number, required : false, default : 0 },  //ยอดรายได้สะสม
    passcode : {type:Number, required: false, default: ''},
    member_pin:{type:String},
    profile_image : {type: Number, required: false, default: ''},
    happy_point : {type: Number, required: false, default: 0},
    bank : {
        name : {type: String, required: false, default : '-'},
        number : {type: String, required : false, default : '-'},
        image : {type: String, required: false, default: '-'},
        status : {type: Boolean, required: false, default : false},
        remark : {type: String, required: false, default : '-'}   // อยู่ระหว่างการตรวจสอบ, ไม่ผ่านการตรวจสอบ, ตรวจสอบสำเร็จ
    },
    iden : {
        number : {type: String, required: false, default : '-'},
        image : {type: String, required: false, default : '-'},
        status: {type: Boolean, required: false, default: false},
        remark : {type: String, required: false, default: '-'}  // อยู่ระหว่างการตรวจสอบ, ไม่ผ่านการตรวจสอบ, ตรวจสอบสำเร็จ
    },
    upline : {
        lv1: {type : String, required: false, default : '-'},
        lv2 : {type: String, required: false, default: '-'},
        lv3 : {type: String, required: false, default: '-'}
    },
    timestamp : {type : Date, required: true},
    status: {type: Boolean, required: false, default : true}
});

const Member = mongoose.model('member', MemberSchema);

const validate = (data)=>{
    const schema = Joi.object({
        card_number : Joi.string().required().label('ไม่พบเลขบัตร'),
        name : Joi.string().required().label('ไม่พบชื่อ'),
        tel : Joi.string().required().label('ไม่พบเบอร์โทร'),
        password : Joi.string().required().label('ไม่พบรหัสผ่าน'),
        address : Joi.string().required().label('ไม่พบที่อยู่'),
        subdistrict: Joi.string().required().label('ไม่พบตำบล'),
        district : Joi.string().required().label('ไม่พบ เขต/อำเภอ'),
        province : Joi.string().required().label('ไม่พบจังหวัด'),
        postcode : Joi.string().required().label('ไม่พบรหัส ปณ.'),
        partner_group:Joi.string(),
        partner_shop_name:Joi.string(),
        partner_shop_address:Joi.string(),
        wallet : Joi.number().default(0),
        money : Joi.number().default(0),
        passcode : Joi.string().default(''),
        profile_image : Joi.string().default(''),
        happy_point: Joi.number().default(0),
        bank : {
           name : Joi.string().default('-'),
           number : Joi.string().default('-'),
           image : Joi.string().default('-'),
           status: Joi.boolean().default(false),
           remark : Joi.string().default('-') 
        },
        iden : {
            number : Joi.string().default('-'),
            image : Joi.string().default('-'),
            status : Joi.boolean().default(false),
            remark : Joi.string().default('-')
        },
        upline : {
            lv1: Joi.string().default('-'),
            lv2: Joi.string().default('-'),
            lv3 : Joi.string().default('-')
        },
        timestamp: Joi.date().required().label('ไม่มีวันที่สมัคร'),
        status: Joi.boolean().default(true)
    });
    return schema.validate(data);
}

module.exports = {Member , validate}