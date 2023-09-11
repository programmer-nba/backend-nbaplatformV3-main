const router = require('express').Router();
const user = require('../../controllers/admin/user.controller')
const auth =require('../../middleware/auth.admin')
router.post('/', auth, user.addUser);
router.get('/', auth, user.getAll);
router.get('/:id', auth, user.getById);
router.put('/:id', auth, user.editUser);
router.delete('/:id', auth, user.delUser);

module.exports = router;