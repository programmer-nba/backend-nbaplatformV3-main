const token_decode = require("../lib/token_decode");
const {MoneyHistory} = require("../models/money.history.model");

exports.getAll = async (req, res) => {
  try {
    const decoded = token_decode(req.headers["token"]);
    const money = await MoneyHistory.find({mem_id: decoded._id});
    if(money){
        return res.status(200).send({data: money});
    }else{
        return res.status(400).send({message: 'ดึงข้อมูลประวัติคอมมิชชั่นไม่สำเร็จ'})
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const money = await MoneyHistory.findById(id);
    if(money){
        return res.status(200).send({data: money});
    }else{
        return res.status(400).send({message: 'ดึงข้อมูลประวัติคอมมิชชั่นไม่สำเร็จ'})
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({message: "มีบางอย่างผิดพลาด"});
  }
};
