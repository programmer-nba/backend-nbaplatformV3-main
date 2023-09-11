const router = require('express').Router();
const member = require('../controllers/member.controller');
const auth = require('../middleware/auth');
const authpublic = require('../middleware/auth.public');

router.post('/create_pin',auth,member.createPin);
router.post('/verify_member_pin',auth,member.verifyMemberPin);
router.post('/change_password',auth, member.change_password);
router.post('/verify_iden',auth, member.verify_iden);
router.post('/verify_bank',auth, member.verify_bank);
router.get('/login_history', auth, member.login_history);
router.get('/online_device', auth,member.online_device);
router.delete('/online_device/:id', auth, member.delete_device);
router.post('/confirm', authpublic, member.confirm);

module.exports = router;