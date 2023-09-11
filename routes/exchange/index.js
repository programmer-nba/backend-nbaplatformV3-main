const router = require('express').Router()
const exchange = require('../../controllers/exchange.controller')
const auth = require('../../middleware/auth')

router.post('/exchange', auth, exchange.Exchange)

module.exports = router