const router = require('express').Router();
const main = require('../controllers/main.controller');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/auth.admin')
const authPassword = require('../middleware/auth.new_password');
router.post('/register', main.register);
router.post('/login', main.login);
router.get('/me', auth, main.me);
router.post('/logout', auth, main.logout);
router.get('/token',authAdmin, main.genPublicToken);

//set new password
router.post('/set_new_password', authPassword, main.setPassword);
module.exports = router;