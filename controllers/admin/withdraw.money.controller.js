const { numberDigitFormat } = require("../../lib/format_function");
const token_decode = require("../../lib/token_decode");
const user_data = require("../../lib/user_data");
const {Member} = require("../../models/member.model");
const { NotifyMember } = require("../../models/member/notify.member.model");
const {WithdrawMoney} = require("../../models/member/withdraw.money.model");

const fs = require("fs");
const {google} = require("googleapis");
const multer = require("multer");
const { MoneyHistory } = require("../../models/money.history.model");
//GOOGLE
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_DRIVE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
  });
  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });
  
  var storage = multer.diskStorage({
    filename: function (req, file, cb) {
      console.log(file);
      cb(null, file.fieldname + "-" + Date.now());
    },
  });

exports.getAll = async (req, res) => {
  try {
    const withdraw = await WithdrawMoney.find();
    if (withdraw) {
      return res.status(200).send({status: true, data: withdraw});
    } else {
      return res.status(400).send({message: "ดึงข้อมูลไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const withdraw = await WithdrawMoney.findById(id);
    if (withdraw) {
      return res.status(200).send({status: true, data: withdraw});
    } else {
      return res.status(400).send({message: "ดึงข้อมูลไม่สำเร็จ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.confirmWithdraw = async (req, res) => {
  try {
    //UPLOAD TO GOOGLE DRIVE
    let upload = multer({storage: storage}).fields([
      {name: "image", maxCount: 10},
    ]);
    upload(req, res, async function (err) {
      if (req.files.image) {
        console.log("มีรูปเข้ามา");
        await uploadImage(req, res);
      } else {
        return res.status(400).send({status: false, message: "ไม่พบรูปภาพ"});
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.cancelWithdraw = async(req, res)=>{
    try{
        const id = req.params.id;
        const user = token_decode(req.headers['token'])
        if(req.body.remark===undefined){
            return res.status(400).send({message: 'ไม่พบเหตุผลที่ยกเลิก'})
        }
        const withdraw = await WithdrawMoney.findById(id);
        if(withdraw){
            if(withdraw.status!=='รอดำเนินการ'){
                return res.status(400).send({message: 'รายการนี้ถูกดำเนินการเรียบร้อยแล้ว ไม่สามารถดำเนินการซ้ำได้'})
            }
            const member = await Member.findById(withdraw.mem_id);
            const new_money = member.money + withdraw.total;
            const update = await WithdrawMoney.findByIdAndUpdate(id, {
                status: 'ยกเลิก',
                emp : user.name
            })
            if(update){
                //แจ้งเตือน
                const data_noti = {
                    mem_id : member._id,
                    topic : `คำขอถูกปฏิเสธ อ้างอิง ${withdraw.ref}`,
                    detail : `ปฎิเสธคำขอถอนเงินรายได้ค่าคอมมิชชั่น หมายเหตุ : ${req.body.remark} และยอดคอมมิชชั่นจะถูกคืน จำนวน ${numberDigitFormat(withdraw.total)}`
                }
                await NotifyMember.create(data_noti);
                //บันทึกประวัติเงินเข้ากระเป่า
                const data_history = {
                    mem_id : member._id,
                    name : `เงินคืนจากการทำรายการถอนไม่สำเร็จ`,
                    type : 'เข้า',
                    amount : withdraw.total,
                    vat : 0,
                    total : withdraw.total,
                    detail : `รายการ คำขอถอนค่าคอมมิชชั่น อ้างอิง ${withdraw.ref}`
                }
                await MoneyHistory.create(data_history);
                await Member.findByIdAndUpdate(member._id,{money : new_money})
                return res.status(200).send({message: 'ยกเลิกรายการถอนค่าคอมมิชชั่นสำเร็จ'})
            }else{
                return res.status(400).send({message: 'ยกเลิกรายการไม่สำเร็จ'})
            }
        }else{
            return res.status(400).send({message: 'ไม่พบข้อมูล'})
        }
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'มีบางอย่างผิดพลาด'})
    }
}

async function uploadImage(req, res) {
  try {
    const id = req.params.id;
    const withdraw = await WithdrawMoney.findById(id);

    if(withdraw.status!=='รอดำเนินการ'){
        return res.status(400).send({message: 'รายการนี้ถูกดำเนินการเรียบร้อยแล้ว ไม่สามารถดำเนินการซ้ำได้'})
    }
    
    const member = await Member.findById(withdraw.mem_id);
    const user = await user_data(req.headers['token']);
    const filePathImg = req.files.image[0].path;
    //UPLOAD รูป
    let fileMetaDataImg = {
      name: req.files.image[0].originalname,
      parents: [`${process.env.GOOGLE_DRIVE_WITHDRAW}`],
    };

    let mediaCus = {
      body: fs.createReadStream(filePathImg),
    };

    const responseImg = await drive.files.create({
      resource: fileMetaDataImg,
      media: mediaCus,
    });
    generatePublicUrl(responseImg.data.id);
    const withdraw_data = {
        image : responseImg.data.id,
        emp : user.name,
        status : 'โอนเรียบร้อย'
    }
    const update = await WithdrawMoney.findByIdAndUpdate(withdraw._id, withdraw_data);
    if(update){
        const noti_data = {
            mem_id : member._id,
            topic : `รายการถอนสำเร็จ อ้างอิง ${withdraw.ref}`,
            detail : `โอนเงินรายการถอนคอมมิชชั่น อ้างอิงที่ ${withdraw.ref} เข้าบัญชีที่ได้ลงทะเบียนไว้ ${numberDigitFormat(withdraw.amount)} บาท`
        }
        await NotifyMember.create(noti_data);
        res.status(200).send({
            message: "ส่งข้อมูลเรียบร้อย",
            status: true,
          });
    }else{
        return res.status(400).send({message: 'ยืนยันการโอนค่าคอมมิชชั่นไม่สำเร็จ'})
    }

    
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
}

async function generatePublicUrl(res) {
  try {
    const fileId = res;
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const result = await drive.files.get({
      fileId: fileId,
      fields: "webViewLink, webContentLink",
    });
  } catch (error) {
    console.log(error.message);
  }
}
