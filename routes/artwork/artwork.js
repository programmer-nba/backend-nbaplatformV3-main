const router = require('express').Router();
const auth  = require('../../middleware/auth');
const Artwork = require('../../controllers/artwork/artwork.controller');

router.get('/category',auth,Artwork.GetCategory);
router.get('/category/:id',auth,Artwork.getProductGraphicByCategoryId);

//create preorder
router.post('/create-preorder',auth,Artwork.CreatePreorder);

module.exports = router;