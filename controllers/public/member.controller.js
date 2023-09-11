const {Member} = require("../../models/member.model");
const Joi = require("joi");
const vat3percent = require("../../lib/function");
const {MoneyHistory} = require("../../models/money.history.model");
const {MoneySavings} = require("../../models/money.savings.model");
const dayjs = require("dayjs");
const {NotifyMember} = require("../../models/member/notify.member.model");
const { numberDigitFormat } = require("../../lib/format_function");

const validate_commission = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().label("ไม่พบชื่อรายการ"),
    tel: Joi.string().required().label("ไม่พบเบอร์ผู้ใช้ platform"),
    platform: {
      owner: Joi.number().required().label("ไม่พบไม่ได้ของบัญชีที่รับเอง"),
      lv1: Joi.number().required().label("ไม่พบรายได้ชั้นที่ 1"),
      lv2: Joi.number().required().label("ไม่พบรายได้ชั้นที่ 2"),
      lv3: Joi.number().required().label("ไม่พบรายได้ชั้นที่ 3"),
    },
    central: {
      central: Joi.number().required().label("ไม่พบยอดกองทุน"),
      allsale: Joi.number().required().label("ไม่พบยอด all sale"),
    },
    emp_bonus: Joi.number().required().label("ไม่พบยอดโบนัสพนักงาน"),
  });
  return schema.validate(data);
};

exports.getPhone = async (req, res) => {
  try {
    const tel = req.params.tel;
    const member = await Member.findOne({tel: tel});
    if (member) {
      const res_data = {
        name: member.name,
        tel: member.tel,
        address: member.address,
        subdistrict: member.subdistrict,
        district: member.district,
        province: member.province,
        postcode: member.postcode,
        happy_point: member.happy_point,
        allsale: member.allsale,
      };
      return res.status(200).send({status: true, data: res_data});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ไม่มีสมาชิกเบอร์นี้ในระบบ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.getByTel = async (req, res) => {
  try {
    const tel = req.params.tel;
    const member = await Member.findOne({tel: tel});
    if (member) {
      const res_data = {
        name: member.name,
        tel: member.tel,
        address: member.address,
        subdistrict: member.subdistrict,
        district: member.district,
        province: member.province,
        postcode: member.postcode,
        happy_point: member.happy_point,
        allsale: member.allsale,
      };
      return res.status(200).send({status: true, data: res_data});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ไม่มีสมาชิกเบอร์นี้ในระบบ"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.giveCommission = async (req, res) => {
  try {
    console.log("ข้อมูลที่รับ :", req.body);
    //validate check
    const {error} = validate_commission(req.body);
    if (error) {
      return res
        .status(400)
        .send({status: false, message: error.details[0].message});
    }
    //check เบอร์โทร
    const member = await Member.findOne({tel: req.body.tel});
    if (!member) {
      return res.status(400).json({
        status: false,
        message: "เบอร์โทรนี้ยังไม่ได้เป็นสมาชิกของ NBA Platfrom",
      });
    }
    let nba_profit = 0;
    /*
            OWNER
        */
    const vat_owner = vat3percent(req.body.platform.owner);
    const new_money_owner = member.money + vat_owner.amount;
    const new_allsale = member.allsale + req.body.platform.owner;
    await Member.findByIdAndUpdate(member._id, {
      money: new_money_owner,
      allsale: new_allsale,
    });
    //history
    const owner_history = {
      mem_id: member._id,
      name: req.body.name,
      type: "เข้า",
      amount: req.body.platform.owner,
      vat: vat_owner.vat,
      total: vat_owner.amount,
      detail: `คอมมิชชั่นจาก ${req.body.name} (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
      timestamp: dayjs(Date.now()).format(),
    };
    await MoneyHistory.create(owner_history);
    //notify
    const noti = {
      mem_id: member._id,
      topic: `รับเงิน ${numberDigitFormat(vat_owner.amount)}`,
      detail: `${req.body.name} จำนวน ${numberDigitFormat(vat_owner.amount)} บาท (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
      timestamp: dayjs(Date.now()).format(),
    };
    await NotifyMember.create(noti);

    //LV1
    if (member.upline.lv1 !== "-") {
      const mem_lv1 = await Member.findById(member.upline.lv1);
      const vat_lv1 = vat3percent(req.body.platform.lv1);
      const new_money_lv1 = mem_lv1.money + vat_lv1.amount;
      const allsale_lv1 = mem_lv1.allsale + req.body.platform.lv1;
      await Member.findByIdAndUpdate(mem_lv1._id, {
        money: new_money_lv1,
        allsale: allsale_lv1,
      });
      //history
      const lv1_history = {
        mem_id: mem_lv1._id,
        name: `ส่วนแบ่ง ${req.body.name}`,
        type: "เข้า",
        amount: req.body.platform.lv1,
        detail: `ส่วนแบ่งค่าคอมมิชชั่นจากผู้ใช้ที่เราแนะนำ (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
        vat: vat_lv1.vat,
        total: vat_lv1.amount,
        timestamp: dayjs(Date.now()).format(),
      };
      await MoneyHistory.create(lv1_history);

      //notify
      const notiLv1 = {
        mem_id: mem_lv1._id,
        topic: `คอมมิชชั่น ${numberDigitFormat(vat_lv1.amount) }`,
        detail: `ส่วนแบ่งจากผู้ใช้งานที่เราแนะนำ จำนวน ${numberDigitFormat(vat_lv1.amount)} บาท`,
        timestamp: dayjs(Date.now()).format(),
      };
      await NotifyMember.create(notiLv1);
    } else {
      nba_profit = nba_profit + req.body.platform.lv1;
    }
    //LV2
    if (member.upline.lv2 !== "-") {
      const mem_lv2 = await Member.findById(member.upline.lv2);
      const vat_lv2 = vat3percent(req.body.platform.lv2);
      const new_money_lv2 = mem_lv2.money + vat_lv2.amount;
      const allsale_lv2 = mem_lv2.allsale + req.body.platform.lv2;
      await Member.findByIdAndUpdate(mem_lv2._id, {
        money: new_money_lv2,
        allsale: allsale_lv2,
      });
      //history
      const lv2_history = {
        mem_id: mem_lv2._id,
        name: `ส่วนแบ่ง ${req.body.name}`,
        type: "เข้า",
        amount: req.body.platform.lv2,
        detail: `ส่วนแบ่งค่าคอมมิชชั่นจากผู้ใช้ที่เราแนะนำ (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
        vat: vat_lv2.vat,
        total: vat_lv2.amount,
        timestamp: dayjs(Date.now()).format(),
      };
      await MoneyHistory.create(lv2_history);
      //notify
      const notiLv2 = {
        mem_id: mem_lv2._id,
        topic: `คอมมิชชั่น ${numberDigitFormat(vat_lv2.amount)}`,
        detail: `ส่วนแบ่งจากผู้ใช้งานที่เราแนะนำ จำนวน ${numberDigitFormat(vat_lv2.amount) } บาท`,
        timestamp: dayjs(Date.now()).format(),
      };
      await NotifyMember.create(notiLv2);
    } else {
      nba_profit = nba_profit + req.body.platform.lv2;
    }
    //LV3
    if (member.upline.lv3 !== "-") {
      const mem_lv3 = await Member.findById(member.upline.lv3);
      const vat_lv3 = vat3percent(req.body.platform.lv3);
      const new_money_lv3 = mem_lv3.money + vat_lv3.amount;
      const allsale_lv3 = mem_lv3.allsale + req.body.platform.lv3;
      await Member.findByIdAndUpdate(mem_lv3._id, {
        money: new_money_lv3,
        allsale: allsale_lv3,
      });
      //history
      const lv3_history = {
        mem_id: mem_lv3._id,
        name: `ส่วนแบ่ง ${req.body.name}`,
        type: "เข้า",
        amount: req.body.platform.lv3,
        detail: `ส่วนแบ่งค่าคอมมิชชั่นจากผู้ใช้ที่เราแนะนำ (หักภาษี ณ ที่จ่ายเรียบร้อยแล้ว)`,
        vat: vat_lv3.vat,
        total: vat_lv3.amount,
        timestamp: dayjs(Date.now()).format(),
      };
      await MoneyHistory.create(lv3_history);
      //notify
      const notiLv3 = {
        mem_id: mem_lv3._id,
        topic: `คอมมิชชั่น ${numberDigitFormat(vat_lv3.amount)}`,
        detail: `ส่วนแบ่งจากผู้ใช้งานที่เราแนะนำ จำนวน ${numberDigitFormat(vat_lv3.amount)} บาท`,
        timestamp: dayjs(Date.now()).format(),
      };
      await NotifyMember.create(notiLv3);
    } else {
      nba_profit = nba_profit + req.body.platform.lv3;
    }

    //บันทึกข้อมูลลง money saving เพื่อสะสม
    const saving = {
      allsale: req.body.central.allsale,
      central: req.body.central.central,
      nba_profit: nba_profit,
      emp_bonus: req.body.emp_bonus,
      timestamp: dayjs(Date.now()).format(),
    };
    await MoneySavings.create(saving);
    return res
      .status(200)
      .send({status: true, message: "ทำรายการสำเร็จ", nba_profit: nba_profit});
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

//ให้คะแนน happy point
exports.giveHappyPoint = async (req, res) => {
  try {
    const validate = (data) => {
      const schema = Joi.object({
        tel: Joi.string().required().label("กรุณากรอกเบอร์โทร"),
        point: Joi.number().required().label("กรุณาส่งคะแนนที่ต้องการ"),
      });
      return schema.validate(data);
    };
    const {error} = validate(req.body);
    if (error) {
      return res
        .status(400)
        .send({status: false, message: error.details[0].message});
    }

    //check phone number member
    const member = await Member.findOne({tel: req.body.tel});
    if (!member) {
      return res
        .status(400)
        .send({status: false, message: "เบอร์โทรนี้ยังไม่ได้สมัคร Platform"});
    }
    
    const new_point = member.happy_point + req.body.point;
    await Member.findByIdAndUpdate(member._id, {happy_point: new_point});
    const noti_data = {
      mem_id : member._id,
      topic : `ได้รับคะแนน ${numberDigitFormat(req.body.point)} คะแนน`,
      detail : `คุณได้รับคะแนนสะสม Happy Point ${numberDigitFormat(req.body.point)} คะแนน จากการใช้บริการร้านค้าหรือพันธมิตรทางธุรกิจในเครือบริษัท NBA Digital Service`
    }
    await NotifyMember.create(noti_data);
    return res
      .status(200)
      .send({status: true, message: "ให้คะแนนเรียบร้อยแล้ว"});
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.transferMember = async (req, res) => {
  try {
    console.log("ข้อมูลทั้งหมด ทั้งหมด : " + req.body.length + " รายการ");
    const old = req.body;
    let new_data = null;
    let move = 0;
    let update = 0;
    for (let i = 0; i < old.length; i++) {
      const con = JSON.stringify(old[i]._id);
      const new_id = JSON.parse(con).$oid;
      const member = await Member.findById(new_id);
      if (member) {
        new_data = {
          card_number: old[i].card_number,
          name: old[i].mem_name,
          tel: old[i].mem_tel,
          password: old[i].mem_password,
          address: old[i].mem_address,
          subdistrict: old[i].mem_subdistrict,
          district: old[i].mem_district,
          province: old[i].mem_province,
          postcode: "-",
          wallet: old[i].mem_money,
          money: old[i].mem_credit,
          iden: {
            number: old[i].mem_iden,
            image: old[i].img_iden,
            status: true,
            remark: "ยืนยันเรียบร้อยแล้ว",
          },
          bank: {
            name: old[i].mem_bank,
            number: old[i].mem_bank_num,
            image: old[i].img_bank,
            status: true,
            remark: "ยืนยันเรียบร้อยแล้ว",
          },
          upline: {
            lv1: old[i].mem_upline[0] !== "0" ? old[i].mem_upline[0] : "-",
            lv2: old[i].mem_upline[1] !== "0" ? old[i].mem_upline[1] : "-",
            lv3: old[i].mem_upline[2] !== "0" ? old[i].mem_upline[2] : "-",
          },
        };
        update = update + 1;
        await Member.findByIdAndUpdate(new_id, new_data);
      } else {
        new_data = {
          _id: new_id,
          card_number: old[i].card_number,
          name: old[i].mem_name,
          tel: old[i].mem_tel,
          password: old[i].mem_password,
          address: old[i].mem_address,
          subdistrict: old[i].mem_subdistrict,
          district: old[i].mem_district,
          province: old[i].mem_province,
          postcode: "-",
          wallet: old[i].mem_money,
          money: old[i].mem_credit,
          iden: {
            number: old[i].mem_iden,
            image: old[i].img_iden,
            status: true,
            remark: "ยืนยันเรียบร้อยแล้ว",
          },
          bank: {
            name: old[i].mem_bank,
            number: old[i].mem_bank_num,
            image: old[i].img_bank,
            status: true,
            remark: "ยืนยันเรียบร้อยแล้ว",
          },
          upline: {
            lv1: old[i].mem_upline[0] !== "0" ? old[i].mem_upline[0] : "-",
            lv2: old[i].mem_upline[1] !== "0" ? old[i].mem_upline[1] : "-",
            lv3: old[i].mem_upline[2] !== "0" ? old[i].mem_upline[2] : "-",
          },
          timestamp: dayjs(Date.now()).format(),
          status: true,
        };
        move = move + 1;
        await Member.create(new_data);
      }
    }
    console.log("--สำเร็จ--");
    return res.status(200).send({
      status: true,
      message: `ทำรายการสำเร็จ ย้าย ${move} รายการ | อัพเดต : ${update} รายการ`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};
