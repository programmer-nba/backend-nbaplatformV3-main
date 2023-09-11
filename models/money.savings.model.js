/**
    บันทึกรายการสะสมรวม เช่น ยอด all sale สะสม  และกำไรที่เหลือของเอ็นบีเอ ที่แบ่งปันไม่ได้
 */
    const mongoose = require('mongoose');
    const Joi = require('joi');
    const dayjs = require('dayjs');
    
    const MoneySavingsSchema = new mongoose.Schema({
        allsale : {type: Number, required: false, default: 0},
        central : {type: Number, required: false, default: 0},
        nba_profit : {type:Number, required:false, default: 0},
        emp_bonus : {type: Number, required: false, default: 0},
        timestamp : {type: Date, required: false, default: dayjs(Date.now()).format()}
    }, {timestamps: true})
    
    const MoneySavings = mongoose.model('money_savings', MoneySavingsSchema);
    
    const validate = (data)=>{
        const schema = Joi.object({
            allsale : Joi.number().default(0),
            central : Joi.number().default(0),
            nba_profit : Joi.number().default(0),
            emp_bonus : Joi.number().default(0),
            timestamp : Joi.date().default(dayjs(Date.now()).format())
        })
        return schema.validate(data);
    }
    
    module.exports = {MoneySavings, validate}