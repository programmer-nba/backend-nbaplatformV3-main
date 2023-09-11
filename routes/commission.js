const router = require('express').Router()
const commission = require('../controllers/commission.controller')
const auth  = require('../middleware/auth')

router.get("/totalcommission", auth, commission.GetCommissionByTel)
router.get("/list", auth, commission.GetAll)
router.get("/listbytel", auth, commission.GetUnsummedCommissionsByTel)
router.get("/userallsale", auth, commission.GetUserAllSale)
router.get("/listbyorderid/:id", auth, commission.GetCommissionByOrderId)
router.get("/happypoint", auth, commission.GetHappyPointBytel)

module.exports = router