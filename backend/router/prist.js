const router = require('express').Router()
const shopownercontrol =require('../controler/pristcontrol')
const auth =require('../middleware/auth')



router.post('/register',shopownercontrol.register)
router.post('/login',shopownercontrol.login)
router.get('/info',auth,shopownercontrol.info)
router.post('/done',auth,shopownercontrol.done)
router.post('/notdone',auth,shopownercontrol.notdone)
router.patch('/redata',auth,shopownercontrol.redata)
router.get('/all',auth,shopownercontrol.all)

module.exports = router
