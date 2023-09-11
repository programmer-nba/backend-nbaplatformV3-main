const {User} = require('../../models/admin/user.model')
const Joi = require('joi');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const token_decode = require('../../lib/token_decode');

exports.login = async(req, res)=>{
    try{
        const vali = (data)=>{
            const schema = Joi.object({
                username : Joi.string().required().label('กรุณากรอกชื่อผู้ใช้งาน'),
                password : Joi.string().required().label('กรุณากรอกรหัสผ่าน')
            });
            return  schema.validate(data);
        }
        const {error} = vali(req.body);
        if(error){
            return res.status(400).send({status: false, message: error.details[0].message})
        }

        const user = await User.findOne({username: req.body.username});

        if(user && (await bcrypt.compare(req.body.password, user.password))){
            const token = jwt.sign({_id:user._id, auth: 'admin'}, `${process.env.TOKEN_KEY}`, {expiresIn : `${process.env.TOKEN_TIME_EXP}`})
            return res.status(200).send({status:true, token: token })
        }else{
            return res.status(400).send({status: false,  message : 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'})
        }
    }catch(err){
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

//call me
//เรียกข้อมูลมูลผู้ใช้
exports.me = async(req,res)=>{
    try{
        const token = token_decode(req.headers['token']);
        const user = await User.findById(token._id);
        if(user){
            return res.status(200).send({status: true, data:user});
        }else{
            return res.status(400).send({status: false, message: 'ไม่พบข้อมูลผู้ใช้นี้'});
        }
    }catch(err){
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}