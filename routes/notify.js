const router = require('express').Router();
const notify = require('../controllers/notify.controller')
const auth = require('../middleware/auth');
router.get('/',auth, notify.getAll);
router.get('/:id', auth, notify.getById);
router.put('/:id', auth, notify.readed);
router.delete('/:id', auth, notify.delete);
router.delete('/', auth, notify.deleteAll);
module.exports = router;