const { NotifyMember , validate_notify }= require('../../models/member/notify.member.model')

exports.create = async (req, res)=>{
    try{
        const {error} = validate_notify(req.body);
        if(error){
            return res.status(400).send({message: error.details[0].message})
        }
        const notify = await NotifyMember.create(req.body);
        if(notify){
            return res.status(200).send({message: 'สร้างรายการแจ้งเตือนสำเร็จ'})
        }else{
            return res.status(400).send({message: 'สร้างรายการแจ้งเตือนไม่สำเร็จ'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}