const mongoose = require("mongoose");
const {linenotify} = require("../../lib/line.notify");
const CheckUserWallet = require("../../lib/checkwallet");
const {DebitWallet} = require("../../lib/transection/debit.wallet");
const Joi = require('joi');

//validater input 
const validate_order = (data)=>{
  const schema = Joi.object({
    artwork_type : Joi.string().required().label('กรุณาระบุ artwork type'),
    cus_name : Joi.string().required().label('กรุณาระบุชื่อลูกค้า'),
    cus_tel : Joi.string().required().label('กรุณาระบุเบอร์โทรลูกค้า'),
    cus_address : Joi.string().required().label('กรุณาระบุที่อยุ่'), //ที่อยู่ลูกค้า
    product_price_id:Joi.string().required().label('กรุณาระบุรหัสสินค้า'),
    amount:Joi.number().required().label('กรุณาระบุจำนวนการสั่งซื้อเป็นตัวเลข'), //จำนวน เซ็ต
    remark : Joi.string().required().allow('').label('รายละเอียดเพิ่มเติม') //รายละเอียดเพิ่มเติม
  });
  return schema.validate(data);
}

//get Artwork category

module.exports.GetCategory = async (req, res) => {
  try {
    var axios = require("axios");
    const request = {
      method: "get",
      headers: {
        "auth-token": process.env.SHOP_API_TOKEN,
      },
      url: `${process.env.SHOP_API}/artwork/product-graphic/category`,
    };

    await axios(request)
      .then((response) => {
        return res.status(200).send(response.data);
      })
      .catch((error) => {
        return res.status(403).send(error.message);
      });
  } catch (error) {
    console.error(error);
    return res.status(500).send({message: "Internal Server Error"});
  }
};

//get Product graphic pricelist by category id

module.exports.getProductGraphicByCategoryId = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(403).send({message: "Invalid id"});
    }

    //send api get product price list

    var axios = require("axios");
    const request = {
      method: "get",
      headers: {
        "auth-token": process.env.SHOP_API_TOKEN,
      },
      url: `${process.env.SHOP_API}/artwork/product-graphic/product/category/${id}`,
    };

    await axios(request)
      .then((response) => {
        return res.status(200).send(response.data);
      })
      .catch((error) => {
        return res.status(403).send({message: error.message});
      });
  } catch (error) {
    console.error(error);
    return res.status(500).send({message: "Internal Server Error"});
  }
};

//create Preorder

module.exports.CreatePreorder = async (req, res) => {
  try {

    const {error} = validate_order(req.body);

    if(error) {
      return res.status(403).send({message:"ข้อมูลไม่ถูกต้อง",data:error.details[0].message})
    }


    console.log({product: req.body.product_price_id, amount: req.body.amount});

    const priceId = req.body.product_price_id;
    const amount = Number(req.body.amount);

    if (!mongoose.isValidObjectId(priceId)) {
      return res.status(403).send({message: "Invalid price id"});
    }

    //send api get product price list

    var axios = require("axios");
    const request = {
      method: "get",
      headers: {
        "auth-token": process.env.SHOP_API_TOKEN,
      },
      url: `${process.env.SHOP_API}/artwork/product-graphic/price/byid/${priceId}`,
    };

    await axios(request)
      .then(async (response) => {
        if (response) {
          const userWallet = await CheckUserWallet(req.user._id);

          const price = Number(response.data.data.price);
          

          console.log('price',price);

          console.log('userWallet',userWallet);
          console.log('user',req.user)

          if (userWallet < price*amount || userWallet <= 0) {
            return res.status(403).send({message: "มีเงินไม่เพียงพอ"});
          }

          const total = response.data.data.price * Number(amount);

          const requestData = {
            shop_id: req.user._id, //id ร้านค้า
            partner_tel: req.user.tel, //'plateform member telephone',
            artwork_type: req.body.artwork_type, //artwork type name string
            cus_name: req.body.cus_name, //plateform member name
            cus_tel: req.body.cus_tel, //plateform member telephone
            cus_address: req.body.cus_address, //platform member address
            payment_type: "wallet", //วิธีการชำระเงิน
            total: total, //ยอดรวมสุทธิ number,
            receive: total, //ยอดเงินที่รับมา
            discount: 0, //ส่วนลด
            order_detail: [{...response.data.data, amount: amount}], //รายละเอียดการสั่งซื้อ
            status: [
              {
                name: "รอตรวจสอบ",
                timestapme: new Date(),
              },
            ], //status
            courier_name: "", //ชื่อชนส่ง
            tracking_code: "", //หมายเลขที่ติดตามการส่งสินค้า
            timestamp: new Date(), //new Date()
            employee: req.user.name,
            employee_nba: "", //ชื่อพนักงานที่รับงานฝั่ง nba
            remark: "", //รายละเอียดเพิ่มเติม
          };

          console.log(requestData);

          //send create preorder to shop
          const preorderConfig = {
            method: "post",
            headers: {
              "auth-token": process.env.SHOP_API_TOKEN,
              "Content-Type": "application/json",
            },
            url: `${process.env.SHOP_API}/artwork/create-preorder`,
            data: requestData,
          };

          axios(preorderConfig)
            .then(async (result) => {
              if (result) {
                //debit user wallet
                const debitData = {
                  mem_id: req.user._id,
                  name: `service artwork ${result.data.data.invoice}`,
                  type: "ออก",
                  amount: price*amount,
                  detail: result.data.data.order_detail,
                  timestamp: `${new Date()}`,
                };

                const token = req.headers["token"];

                await DebitWallet(token, debitData);

                //line message
                const message = `
                ส่งงาน order graphic แล้ว
                
                `
                await linenotify(message);


                return res
                  .status(200)
                  .send({message: "ส่ง preorder สำเร็จ", data: result.data});
              }
            })
            .catch((error) => {
              return res
                .status(500)
                .send({message: "ส่ง preorder ไม่สำเร็จ", data: error});
            });
        } else {
          return res.status(403).send({message: "network error"});
        }
      })
      .catch((error) => {
        return res.status(403).send({message: error.message});
      });
  } catch (error) {
    console.error(error);
    return res.status(500).send({message: "Internal Server Error"});
  }
};


