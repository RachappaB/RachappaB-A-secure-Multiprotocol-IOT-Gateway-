const router = require('express').Router()
const controler =require('../controler/customercontrol')
const auth =require('../middleware/auth')
router.post('/register',controler.register)
router.post('/login',controler.login)
router.get('/cart',auth,controler.cart)
router.get('/info',auth,controler.info)
router.post('/pooja',auth,controler.pooja)
router.get('/all',controler.all)
router.get('/admin',controler.admin)
router.get('/order',auth,controler.order)
router.patch('/addcart', auth, controler.addCart)
router.post('/orders', controler.orders);
router.post('/verfiy', controler.verfiy);
router.patch('/redata',auth,controler.redata)
router.get('/',function(req,res)
{
    res.json({msg:"welcome to customer"})
})
module.exports = router

// Customer controler named as controler for easy to use in line 2
//Orders for razor pay  to give token
// redata means edit profile
//vrfy is for future use 