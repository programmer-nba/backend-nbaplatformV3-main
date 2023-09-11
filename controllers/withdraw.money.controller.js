const dayjs = require("dayjs");
const token_decode = require("../lib/token_decode");
const {Member} = require("../models/member.model");
const {WithdrawMoney} = require("../models/member/withdraw.money.model");
const Joi = require("joi");
const numberDigitFormat = require("../lib/numberDigitFormat");
const {MoneyHistory} = require("../models/money.history.model");
const {linenotify} = require("../lib/line.notify");

exports.sendRequestWithdraw = async (req, res) => {
  try {
    const decoded = token_decode(req.headers["token"]);
    const vali = (data) => {
      const schema = Joi.object({
        amount: Joi.number().required().label("ไม่พบจำนวน"),
      });
      return schema.validate(data);
    };
    const {error} = vali(req.body);
    if (error) {
      return res.status(400).send({message: error.details[0].message});
    }

    const member = await Member.findById(decoded._id);
    if (!member) {
      return res.status(400).send({message: "ไม่สามารถทำรายการได้"});
    }
    //สถานะบัญชีธนาคาร
    if(!member.bank.status){
      return res.status(400).send({message: 'บัญชีนี้ยังไม่ได้ยืนยันข้อมูลบัญชีธนาคาร กรุณายืนยันข้อมูลบัญชีธนาคารก่อน'});
    }
    
    const charge = 10;
    if (req.body.amount + charge > member.money) {
      return res
        .status(400)
        .send({message: "ยอดเงินในกระเป๋าของคุณไม่เพียงพอ"});
    }
    const ref = await refNumber();
    const data_withdraw = {
      ref: ref,
      mem_id: member._id,
      amount: req.body.amount,
      charge: charge,
      total: req.body.amount + charge,
    };

    const withdraw = await WithdrawMoney.create(data_withdraw);

    if (withdraw) {
      //หักยอดเงินไปในกระเป๋า member
      const new_money = member.money - (req.body.amount + charge);
      await Member.findByIdAndUpdate(member._id, {money: new_money});

      //แจ้งเตือนไลน์
      const message = `
  *คำขอถอนค่าคอมมิชชั่น*
  เลขที่อ้างอิง : ${withdraw.ref}
  จำนวน : ${numberDigitFormat(req.body.amount)} บาท
  ค่าธรรมเนียม : ${numberDigitFormat(charge)} บาท
  รวมทั้งหมด : ${numberDigitFormat(withdraw.total)} บาท 
  --ผู้ใช้งาน--
  ชื่อ : ${member.name}
  เบอร์โทร : ${member.tel}
  *ตรวจสอบได้ที่ : * https://platform-admin.nbadigitalservice.com
          `;
      await linenotify(message);
      //บันทึกประวัติเงินออก
      const data_history = {
        mem_id: member._id,
        name: `ยื่นคำขอถอนเงินคอมมิชชั่น อ้างอิง ${withdraw.ref}`,
        type: "ออก",
        amount: data_withdraw.total,
        vat: 0,
        total: data_withdraw.total,
        detail: `ยืนยันขอเงินคอมมิชชั่นเข้าบัญชีธนาคาร อ้างอิง ${
          withdraw.ref
        } จำนวนยอด ${numberDigitFormat(
          req.body.amount
        )} บาท ค่าธรรมเนียมทำราย ${numberDigitFormat(
          charge
        )} บาท (รวม ${numberDigitFormat(data_withdraw.total)} บาท)`,
      };
      await MoneyHistory.create(data_history).catch((err)=>{
        console.log(err);
      });

      return res
        .status(200)
        .send({
          message:
            "ส่งคำขอสำเร็จ ใช้เวลาตรวจสอบและยอดเงินจะเข้าบัญชีที่่ยืนยันไว้ภายใน 24 ชั่วโมง",
        });
    } else {
      return res
        .status(400)
        .send({message: "ส่งคำขอไม่สำเร็จ กรุณาทำรายการอีกครั้ง"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.getAll = async (req, res) => {
  try {
    const decoded = token_decode(req.headers["token"]);
    const withdraw = await WithdrawMoney.find({mem_id: decoded._id});
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

async function refNumber() {
  const withdraw = await WithdrawMoney.find();
  let invoice_number = null;
  if (withdraw.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `REF`.padEnd(10, "0") + num;
      check = await WithdrawMoney.find({ref: data});
      if (check.length === 0) {
        invoice_number = `REF`.padEnd(10, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    invoice_number = `REF`.padEnd(10, "0") + "1";
  }
  return invoice_number;
}
