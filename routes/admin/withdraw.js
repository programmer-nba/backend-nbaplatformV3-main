const router = require('express').Router();
const withdraw_money = require('../../controllers/admin/withdraw.money.controller')
const authAdmin = require('../../middleware/auth.admin')

router.get('/',authAdmin, withdraw_money.getAll);
router.get('/:id', authAdmin, withdraw_money.getById);
router.put('/:id/confirm', authAdmin, withdraw_money.confirmWithdraw);
router.put('/:id/cancel', authAdmin, withdraw_money.cancelWithdraw);
module.exports = router;