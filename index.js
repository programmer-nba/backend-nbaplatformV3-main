require("dotenv").config();
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
app.use(bodyParser.json({limit: '50mb', type: 'application/json'}));
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require("cors");
mongoose.set('strictQuery',true)
mongoose.connect(process.env.DB,{ useNewUrlParser: true })

//test index.js

app.use(express.json());
app.use(cors());

//Member
app.use('/v2/nba-platform', require("./routes/index"));
app.use('/v2/nba-platform/member', require("./routes/member"));

//Wallet เติมเงินเข้ากระเป๋า
app.use('/v2/nba-platform/wallet', require('./routes/wallet'));

//withdraw ถอนเงิน
app.use('/v2/nba-platform/withdraw', require('./routes/withdraw'));

//แจ้งเตือน
app.use('/v2/nba-platform/notify', require('./routes/notify'));

//ประวัติค่าคอมมิชชั่น Money History
app.use('/v2/nba-platform/money/history', require('./routes/money.history'));

//ปวะวัติ wallet
app.use('/v2/nba-platform/wallet/history', require('./routes/wallet.history'));

//Admin
app.use('/v2/nba-platform/admin', require('./routes/admin/index'));
app.use('/v2/nba-platform/admin/user', require('./routes/admin/user'));
app.use('/v2/nba-platform/admin/member', require('./routes/admin/member'));
app.use('/v2/nba-platform/admin/wallet', require('./routes/admin/wallet'));
app.use('/v2/nba-platform/admin/withdraw',require('./routes/admin/withdraw'));
//Public
app.use('/v2/nba-platform/public/member' ,require('./routes/public/member'));
app.use('/v2/nba-platform/public/report', require('./routes/public/report'));

//SMS
app.use('/v2/nba-platform/sms/otp', require('./routes/sms/otp'));

//Counter service
app.use('/v2/nba-platform/counter_service/mobile_topup',require('./routes/counterservice/mobile.topup'));
app.use('/v2/nba-platform/counter_service/card_topup',require('./routes/counterservice/card.topup'));
app.use('/v2/nba-platform/counter_service/mobile_bill',require('./routes/counterservice/mobile.bill'));
app.use('/v2/nba-platform/counter_service/barcode_service',require('./routes/counterservice/barcode'));
app.use('/v2/nba-platform/counter_service/nba_service',require('./routes/counterservice/nba'));
app.use('/v2/nba-platform/counter_service/wallet',require('./routes/counterservice/wallet'));

//NBA service
app.use('/v2/nba-platform/nbaservice', require('./routes/NBAservice/index'))

// Order
app.use('/v2/nba-platform/order', require('./routes/order'))

// commission
app.use('/v2/nba-platform/commission', require('./routes/commission'))

// exchange
app.use('/v2/nba-platform/exchangepoint', require('./routes/exchange/index'))

//artwork
app.use('/v2/nba-platform/artwork',require('./routes/artwork/artwork'));

//
const port = process.env.PORT || 9010;

app.listen(port, ()=>{
    console.log(`API Runing PORT ${port}`);
});
