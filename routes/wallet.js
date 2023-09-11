const router = require('express').Router();
const auth  = require('../middleware/auth');
const wallet = require('../controllers/wallet.controller')

router.post('/', auth,wallet.create);
router.get('/', auth, wallet.getAll);
router.get('/:id', auth, wallet.getById);
router.get('/history/in-out', auth, wallet.getHistory);
module.exports = router;