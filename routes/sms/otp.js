const router = require('express').Router();
const sms = require('../../controllers/sms/sms.controller.js')
const auth = require('../../middleware/auth.public.js')
router.post('/verify', sms.verify);
router.post('/check', sms.check);
router.post('/check_new_password', sms.checkForgotPassword);
module.exports = router;