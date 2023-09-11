const router = require('express').Router();
const withdraw_money = require('../controllers/withdraw.money.controller')
const auth = require('../middleware/auth');

router.post('/',auth, withdraw_money.sendRequestWithdraw);
router.get('/',auth, withdraw_money.getAll);
router.get('/:id', auth, withdraw_money.getById);


module.exports = router;