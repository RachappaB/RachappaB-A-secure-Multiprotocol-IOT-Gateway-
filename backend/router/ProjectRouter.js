const router = require('express').Router()
const Users = require('../modules/customerModel')
const usercontrol  = require('../controler/userControl')
const Project = require('../modules/projectModel')
const auth =require('../middleware/auth')
const math = require('mathjs'); // Example for math processing
const jstat = require('jstat'); // Example for statistical analysis
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



// Analyze endpoint
router.post('/analyze', async (req, res) => {
    try {
        const { instruction } = req.body;
        console.log("Step 1: Received instruction:", instruction);

        let result;
        const cleanedInstruction = instruction.trim();
        console.log("Step 2: Cleaned instruction:", cleanedInstruction);

        // Trim spaces around the instruction type
        const type = cleanedInstruction.split(':')[0].trim();
        const content = cleanedInstruction.split(':')[1]?.trim();

        if (type === 'math') {
            try {
                console.log("Step 3: Math expression to evaluate:", content);
                result = math.evaluate(content);
                console.log("Step 4: Math evaluation result:", result);
            } catch (mathError) {
                console.error("Math evaluation error:", mathError.message);
                return res.status(500).json({ message: 'Math evaluation error', error: mathError.message });
            }
        } else if (type === 'stats') {
            try {
                const numbers = content.replace('mean(', '').replace(')', '').split(',').map(Number);
                console.log("Step 3: Numbers for mean calculation:", numbers);
                result = jstat.mean(numbers);
                console.log("Step 4: Mean calculation result:", result);
            } catch (statsError) {
                console.error("Statistical calculation error:", statsError.message);
                return res.status(500).json({ message: 'Statistical calculation error', error: statsError.message });
            }
        }  else {
            result = 'Unknown instruction';
            console.log("Step 3: Instruction type unknown, returning:", result);
        }

        res.json({ result });
        console.log("Step 5: Response sent with result:", result);
    } catch (error) {
        console.error('General error processing the instruction:', error.message);
        res.status(500).json({ message: 'Error processing the instruction', error: error.message });
    }
});

module.exports = router
