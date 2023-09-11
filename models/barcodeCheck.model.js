const mongoose = require('mongoose');
const Joi = require('joi');

const barcodeCheck = new mongoose.Schema({
    productid: {type: String, required: true},
    barcode: {type: String, required: true},
    mobile: {type: String, required: true},
    price: {type: Number, required: true},
    data1: {type: String, required: true},
    data2: {type: String, required: true},
    data3: {type: String, required: true},
    data4: {type: String, required: true},
    data5: {type: String, required: true},
    transid: {type: String},
    status: {type: String, default: 'barcode ใช้งานได้'}
})

const BarcodeCheck = mongoose.model('barcodecheck', barcodeCheck)

const validate  = (data) => {
    const schema = Joi.object({
        barcode: Joi.string().required().label('ไม่พบ barcode'),
        mobile: Joi.string().required().label('ไม่พบเบอร์โทร'),
        price: Joi.string().required().label('ไม่พบราคา'),
        data1: Joi.string().required().label('ไม่พบ data1'),
        data2: Joi.string().required().label('ไม่พบ data2'),
        data3: Joi.string().required().label('ไม่พบ data3'),
        data4: Joi.string().required().label('ไม่พบ data4'),
        data5: Joi.string().required().label('ไม่พบ data5'),
    })
    return schema.validate(data);
}

module.exports = { BarcodeCheck, validate }