const router = require('express').Router();
const main = require('../../controllers/admin/main.controller')
const auth = require('../../middleware/auth.admin')
router.post('/login', main.login);
router.get('/me', auth, main.me);
module.exports = router;