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


router.get('/list', auth, async function (req, res) {
    try {
        // Fetch projects where the logged-in user is the owner
        const projects = await Project.find({ owner: req.user.id }).select('projectName');
        res.json({ projects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.get('/view/:id', auth, async (req, res) => {
    try {
        console.log("View");
        const projectId = req.params.id;

        // Find project by ID
        const project = await Project.findById(projectId).populate('owner', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Error fetching project data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router
