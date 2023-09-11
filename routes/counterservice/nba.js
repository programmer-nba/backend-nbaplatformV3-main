const router = require('express').Router();
const NbaService = require('../../controllers/counterservice/nba.service.controller');
const auth = require('../../middleware/auth');


router.get('/',auth,NbaService.GetNbaCounterService);
router.post('/create-preorder',auth,NbaService.CreatePreOrder);

module.exports = router;