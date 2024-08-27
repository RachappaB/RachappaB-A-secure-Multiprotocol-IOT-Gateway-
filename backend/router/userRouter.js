const router = require('express').Router()
const usercontrol  = require('../controler/userControl')
const auth =require('../middleware/auth')
router.get('/refresh_token',usercontrol.refreshtoken)
router.get('/logout',usercontrol.logout)

module.exports = router
