const router = require('express').Router()
const Users = require('../modules/customerModel')
const usercontrol  = require('../controler/userControl')
const Project = require('../modules/projectModel')
const auth =require('../middleware/auth')
router.get('/',function(req,res)
{
    res.json({msg:"welcome to create project"})
})



router.post('/create',auth,async function(req,res){
    try {
        const owner  = await Users.findById({"_id":req.user.id}) 

        const {projectName,description,mode,numOfColumns,columnNamesdata} =req.body;
        const newprojoect = new Project({projectName,description,mode,owner,numOfColumns,columnNamesdata});
        await newprojoect.save();
        res.send("ok");

    } catch (error) {
        console.log(error)
        res.send(error)
        
    }

})

module.exports = router
