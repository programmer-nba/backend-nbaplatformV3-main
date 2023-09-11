const router = require('express').Router();
const member = require('../../controllers/admin/member.controller');
const notify_member = require('../../controllers/admin/notify.member.controller');
const auth = require('../../middleware/auth.admin');
router.get('/', auth, member.getAll);
router.get('/:id',auth,  member.getById);
router.put('/:id', auth, member.update);
router.delete('/:id', auth, member.delete);
router.post('/notify', auth, notify_member.create);
module.exports = router;