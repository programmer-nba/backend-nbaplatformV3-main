const token_decode = require('../lib/token_decode');
const {NotifyMember} = require('../models/member/notify.member.model')

exports.getAll = async (req, res)=>{
    try{
        const decoded = token_decode(req.headers['token'])
        const notify = await NotifyMember.find({mem_id: decoded._id});
        if(notify){
            return res.status(200).send({status: true, data: notify.reverse()})
        }else{
            return res.status(400).send({message: 'ดึงรายการแจ้งเตือนไม่สำเร็จ'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: "มีบางอย่างผิดพลาด"})
    }
}
exports.getById =async(req, res)=>{
    try{
        const id = req.params.id;
        const notify = await NotifyMember.findById(id);
        if(notify){
            return res.status(200).send({data: notify})
        }else{
            return res.status(400).send({message: 'ดึงข้อมูลแจ้งเตือนไม่สำเร็จ'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

exports.delete = async(req, res)=>{
    try{
        const id = req.params.id;
        const notify = await NotifyMember.findByIdAndDelete(id);
        if(notify){
            return res.status(200).send({message: 'ลบรายการแจ้งเตือนสำเร็จ'})
        }else{
            return res.status(400).send({message: 'ลบรายการแจ้งเตือนไม่สำเร็จ'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

exports.readed = async (req, res)=>{
    try{
        const id = req.params.id;
        const notify = await NotifyMember.findByIdAndUpdate(id, {status : true})
        if(notify){
            return res.status(200).send({status: true, message: 'อัพเดตสถานะการอ่านเรียบร้อยแล้ว'})
        }else{
            return res.status(400).send({status: false, message: 'อัพเดตสถานะการอ่านไม่สำเร็จ'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

exports.deleteAll = async(req, res)=>{
    try{
        const decoded = token_decode(req.headers['token'])
        const noti = await NotifyMember.deleteMany({mem_id : decoded._id});
        if(noti){
            return res.status(200).send({message: 'ลบการแจ้งเตือนทั้งหมดสำเร็จ'})
        }else{
            return res.status(400).send({message: 'ลบการแจ้งเตือนไม่สำเร็จ'})
        }
        
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}