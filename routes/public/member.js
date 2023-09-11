const router = require('express').Router();
const Member = require('../../controllers/public/member.controller')
const MemberTeam = require('../../controllers/public/memberteam.controller')
const auth = require('../../middleware/auth.public');
const authpartner = require('../../middleware/auth_partner');


router.get('/tel/:tel', auth, Member.getByTel);
router.get('/check/:tel', Member.getPhone);
// router.post('/givecommission', auth, Member.giveCommission);
// router.post('/givehappypoint', auth, Member.giveHappyPoint);
// router.post('/transfer_member', Member.transferMember);
router.get('/memberteam/:tel', authpartner, MemberTeam.getMemberTeam)

module.exports = router;