const {Member} = require('../../models/member.model')
const bcrypt = require('bcrypt')
exports.getAll = async (req, res)=>{
    try{
        const member = await Member.find();
        if(member){
            return res.status(200).send({status: true, data : member});
        }else{
            return res.status(400).send({status: false, message: 'ดึงข้อมูลไม่สำเร็จ'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

//get member by id
exports.getById = async (req, res)=>{
    try{
        const id = req.params.id;
        const member = await Member.findById(id);
        if(member){
            return res.status(200).send({status: true, data : member});
        }else{
            return res.status(400).send({status: false, message: 'ไม่พบข้อมูลผู้ใช้งาน'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

exports.update = async(req, res)=>{
    try{
        const id = req.params.id;
        let data = null;
        if(req.body.password){
            const encryptPassword = await bcrypt.hash(req.body.password, 10);
            data = {...req.body, password : encryptPassword}
        }else{
            data = {...req.body};
        }
        const member = await Member.findByIdAndUpdate(id, data);
        if(member){
            return res.status(200).send({status: true, message: 'อัพเดตข้อมูลผู้ใช้งานสำเร็จ'})
        }else{
            return res.status(400).send({status: false,message: 'อัพเดตข้อมูลผู้ใช้งานไม่สำเร็จ'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

exports.delete = async(req,res)=>{
    try{
        const id = req.params.id;
        const member = await Member.findByIdAndDelete(id);
        if(member){
            return res.status(200).send({status: true, message: 'ลบข้อมูลผู้ใช้งานสำเร็จ'})
        }else{
            return res.status(400).send({status: false, message: 'ลบข้อมูลผู้ใช้งานไม่สำเร็จ'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}