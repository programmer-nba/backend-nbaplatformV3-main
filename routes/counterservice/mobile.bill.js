const router = require('express').Router();
const MobileBill = require('../../controllers/counterservice/mobile.bill.controller');
const auth = require('../../middleware/auth');

router.get('/',auth,MobileBill.GetMobileBillService);
router.post('/check',auth,MobileBill.Check);
router.post('/get-transaction',auth,MobileBill.GetTransaction);
router.post('/confirm',auth,MobileBill.Confirm);


module.exports = router;