const router = require('express').Router()
const order = require('../controllers/NBAservice/order.controller')
const auth  = require('../middleware/auth')
const authpartner = require('../middleware/auth_partner')

router.get("/list/:id", auth, order.GetAll)
router.post("/receiverefund", authpartner, order.GetCanceledOrder)

module.exports = router