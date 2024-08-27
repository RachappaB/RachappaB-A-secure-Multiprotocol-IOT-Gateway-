const router = require('express').Router()
const shopownercontrol =require('../controler/shopownercontrol')
const auth =require('../middleware/auth')

router.post('/register',shopownercontrol.register)
router.post('/login',shopownercontrol.login)
router.post('/add',auth,shopownercontrol.add)
router.post('/photo',auth,shopownercontrol.photo)
router.post('/destory',auth,shopownercontrol.destroy)

router.get('/all',auth,shopownercontrol.all)
router.get('/info',auth,shopownercontrol.info)

router.post('/done',auth,shopownercontrol.done)
router.post('/notdone',auth,shopownercontrol.notdone)
router.patch('/redata',auth,shopownercontrol.redata)

module.exports = router
