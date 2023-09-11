const router = require('express').Router();
const wallet = require('../../controllers/admin/wallet.controller')
const authAdmin = require('../../middleware/auth.admin')

router.put('/confirm/:id',authAdmin, wallet.confirm); //ยืนยันการแจ้งชำระเงิน
router.put('/cancel/:id', authAdmin, wallet.cancel);    //ยกลิกการแจ้งชำระเงิน
router.get('/:id', authAdmin, wallet.getById);
router.get('/', authAdmin,wallet.getAll);

module.exports = router;