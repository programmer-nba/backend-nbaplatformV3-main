const router = require('express').Router();
const BarcodeService = require('../../controllers/counterservice/barcode.controller');
const auth = require('../../middleware/auth');

router.get('/',auth,BarcodeService.GetBarcodeService);
router.post('/check',auth,BarcodeService.Check);
router.post('/verify',auth,BarcodeService.Verify);
router.post('/confirm',auth,BarcodeService.Confirm);



module.exports = router;