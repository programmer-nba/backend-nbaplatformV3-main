const router = require('express').Router();
const CardTopup = require('../../controllers/counterservice/card.topup.controller');
const auth = require('../../middleware/auth');

router.get('/',auth,CardTopup.GetCardTopup);
router.post('/check',auth,CardTopup.Check);
router.post('/confirm',auth,CardTopup.Confirm);


module.exports = router;

