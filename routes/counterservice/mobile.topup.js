const router = require('express').Router();
const MobileTopup = require('../../controllers/counterservice/mobile.topup.controller');
const auth = require('../../middleware/auth');

router.get('/',auth,MobileTopup.GetMobileTopup);
router.post('/check',auth,MobileTopup.Check);
router.post('/confirm',auth,MobileTopup.Confirm);

module.exports = router;

