const router = require('express').Router();
const report = require('../../controllers/public/report.controller');
const auth = require('../../middleware/auth.public');

router.get('/', auth, report.getProfit);

module.exports = router;