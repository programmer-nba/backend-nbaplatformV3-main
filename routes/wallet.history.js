const router = require('express').Router()
const WalletHistory = require('../controllers/wallet.history.controller')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/auth.admin')

router.get('/list', authAdmin, WalletHistory.GetAll)
router.get('/memberhistory', auth, WalletHistory.GetById)

module.exports = router