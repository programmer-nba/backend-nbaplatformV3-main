const mongoose = require('mongoose');

const ErrorLogSchema = mongoose.Schema({
    name:{type:String,required:true},
    error:{type:Object}
}, {timestamps: true})

const ErrorLog = mongoose.model('ErrorLog',ErrorLogSchema);

module.exports = {ErrorLog};