const {Wallet, validate} = require("../models/wallet.model");
const {Member} = require("../models/member.model");
const token_decode = require("../lib/token_decode");

const fs = require("fs");
const {google} = require("googleapis");
const multer = require("multer");
const {linenotify} = require("../lib/line.notify");
const Joi = require("joi");
const {WalletHistory} = require("../models/wallet.history.model");

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

exports.create = async (req, res) => {
  try {
    //UPLOAD TO GOOGLE DRIVE
    let upload = multer({storage: storage}).fields([
      {name: "image", maxCount: 10},
    ]);

    upload(req, res, async function (err) {
      if (req.files.image) {
        console.log("มีรูปเข้ามา");
        await uploadImageWallet(req, res);
      } else {
        return res.status(400).send({status: false, message: "ไม่พบรูปภาพ"});
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.getAll = async (req, res) => {
  try {
    const decoded = token_decode(req.headers["token"]);
    const wallet = await Wallet.find({mem_id: decoded._id});
    if (wallet) {
      return res.status(200).send({status: true, data: wallet});
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
    const decoded = token_decode(req.headers["token"]);
    const wallet = await Wallet.findOne({_id: id, mem_id: decoded._id});
    if (wallet) {
      return res.status(200).send({status: true, data: wallet});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ไม่พบข้อมูลที่ค้นหา"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.getHistory = async (req, res) => {
  try {
    const decoded = token_decode(req.headers["token"]);
    const wallet_history = await WalletHistory.find({mem_id: decoded._id});
    if (wallet_history) {
      return res.status(200).send({status: true, data: wallet_history});
    } else {
      return res
        .status(400)
        .send({status: false, message: "ไม่พบข้อมูลที่ค้นหา"});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

async function uploadImageWallet(req, res) {
  try {
    const filePathImg = req.files.image[0].path;
    const decode = token_decode(req.headers["token"]);
    const member = await Member.findById(decode._id);
    if (!member) {
      return res
        .status(400)
        .send({status: false, message: "ไม่พบผู้ใช้งานนี้ในระบบ"});
    }
    //UPLOAD รูป
    let fileMetaDataImg = {
      name: req.files.image[0].originalname,
      parents: [`${process.env.GOOGLE_DRIVE_WALLET}`],
    };

    let mediaCus = {
      body: fs.createReadStream(filePathImg),
    };

    const responseImg = await drive.files.create({
      resource: fileMetaDataImg,
      media: mediaCus,
    });

    generatePublicUrl(responseImg.data.id);
    const invoice = await invoiceNumber();
    const data_create = {
      ...req.body,
      image: responseImg.data.id,
      invoice: invoice,
      mem_id: member._id,
      type: "slip",
    };
    const res_wallet = await Wallet.create(data_create);
    if (res_wallet) {
      //แจ้งเตือนไลน์
      const message = `
  *แจ้งเติมเงินเข้ากระเป๋า*
  เลขที่อ้างอิง : ${invoice}
  จำนวน : ${req.body.amount} บาท
  --ผู้ใช้งาน--
  ชื่อ : ${member.name}
  เบอร์โทร : ${member.tel}
  *ตรวจสอบได้ที่ : * https://platform-admin.nbadigitalservice.com
          `;
      await linenotify(message);

      res.status(200).send({
        message: "แจ้งเติมเงินเรียบร้อย",
        status: true,
      });
    } else {
      res.status(404).send({
        message: `ไม่สามารถสร้างได้`,
        status: false,
      });
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

async function invoiceNumber() {
  const wallet = await Wallet.find();
  let invoice_number = null;
  if (wallet.length !== 0) {
    let data = "";
    let num = 0;
    let check = null;
    do {
      num = num + 1;
      data = `W`.padEnd(10, "0") + num;
      check = await Wallet.find({invoice: data});
      if (check.length === 0) {
        invoice_number = `W`.padEnd(10, "0") + num;
      }
    } while (check.length !== 0);
  } else {
    invoice_number = `W`.padEnd(10, "0") + "1";
  }
  return invoice_number;
}
