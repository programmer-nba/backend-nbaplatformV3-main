const router = require('express').Router()
const facebookservice = require('../../controllers/NBAservice/facebook.service.controller')
const websiteservice = require('../../controllers/NBAservice/website.service.controller')
const accountservice = require('../../controllers/NBAservice/account.service.controller')
const actservice = require('../../controllers/NBAservice/act.service.controller')
const itsupportservice = require('../../controllers/NBAservice/itsupport.service.controller')
const insuranceservice = require('../../controllers/NBAservice/insurance.service.controller')
const taxservice = require('../../controllers/NBAservice/tax.service.controller')
const graphic = require('../../controllers/NBAservice/graphic.controller')
const auth  = require('../../middleware/auth')

//facebookservice
router.get("/facebookservice/list", auth, facebookservice.GetService)
router.post("/facebookservice/order", auth, facebookservice.order)

//websiteservice
router.get("/websiteservice/list", auth, websiteservice.GetService)
router.post("/websiteservice/order", auth, websiteservice.order)

//accountservice
router.get("/accountservice/list", auth, accountservice.GetService)
router.get("/accountservice/package/listbycate/:id", auth, accountservice.GetServiceByCateId)
router.post("/accountservice/order", auth, accountservice.order)

//actlegalservice
router.get("/actlegalservice/list", auth, actservice.GetService)
router.get("/actlegalservice/package/listbycate/:id", auth, actservice.GetServiceByCateId)
router.post("/actlegalservice/order", auth, actservice.order)

//itsupportservice
router.get("/itsupportservice/list", auth, itsupportservice.GetService)
router.post("/itsupportservice/order", auth, itsupportservice.order)

//insuranceservice
router.get("/insuranceservice/list", auth, insuranceservice.GetService)
router.get("/insuranceservice/package/listbycate/:id", auth, insuranceservice.GetServiceByCateId)
router.post("/insuranceservice/order", auth, insuranceservice.order)

//taxservice
router.get("/taxservice/list", auth, taxservice.GetService)
router.get("/taxservice/package/listbycate/:id", auth, taxservice.GetServiceByCateId)
router.post("/taxservice/order", auth, taxservice.order)

// graphic
router.post("/graphic/order", auth, graphic.order)

module.exports = router