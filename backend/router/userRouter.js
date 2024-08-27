const router = require('express').Router()
const usercontrol  = require('../controler/userControl')
const auth =require('../middleware/auth')
router.get('/refresh_token',usercontrol.refreshtoken)
router.get('/logout',usercontrol.logout)
router.get('/',function(req,res)
{
    res.json({msg:"welcome to user"})
})

module.exports = router
