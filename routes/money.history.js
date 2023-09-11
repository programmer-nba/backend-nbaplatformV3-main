const router = require('express').Router();
const MoneyHistory = require('../controllers/money.history.controller');
const auth = require('../middleware/auth')
router.get('/', auth, MoneyHistory.getAll);
router.get('/:id',auth,  MoneyHistory.getById);
module.exports = router;