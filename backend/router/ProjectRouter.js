const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db'); // Adjust the path to your database file

const Users = require('../modules/customerModel');
const Project = require('../modules/projectModel');
const auth = require('../middleware/auth');



// Helper function to generate REST API URLs

function generateApiUrls(projectId) {
    const baseUrl = 'http://localhost:3001/project';
    return {
        writeUrl: `${baseUrl}/insert/${projectId}`, // Endpoint to insert data
        limitUlr: `${baseUrl}/table/rows/${projectId}?limit=10&from=top`,
        readUrl: `${baseUrl}/table/${projectId}`   // Endpoint to read data
    };
}



// Route to fetch REST API URLs
router.get('/api-urls/:projectId', async (req, res) => {
    try {
        const projectId = req.params.projectId;
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }
        const urls = generateApiUrls(projectId);
        res.json(urls);
    } catch (error) {
        // console.error('Error fetching API URLs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Endpoint to fetch a specific number of rows from the top or bottom of the table
router.get('/table/rows/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const { limit = 10, from = 'top' } = req.query; // Default to 10 rows from the top

    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
    }

    const tableName = `project_${projectId}`;
    let query = '';

    if (from === 'top') {
        query = `SELECT * FROM ${tableName} ORDER BY timestamp ASC LIMIT ?`;
    } else if (from === 'bottom') {
        query = `SELECT * FROM ${tableName} ORDER BY timestamp DESC LIMIT ?`;
    } else {
        return res.status(400).json({ message: 'Invalid value for "from". Use "top" or "bottom".' });
    }

    db.all(query, [parseInt(limit)], (err, rows) => {
        if (err) {
            // console.error('Error fetching rows:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }
        res.json({ rows });
    });
});



// Endpoint to insert data into a project table
router.post('/insert/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const tableName = `project_${projectId}`;
    const data = req.body; // Data to insert

    // Construct the SQL query to insert data
    const columns = Object.keys(data).map(key => `${key}`).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

    db.run(query, values, function(err) {
        if (err) {
            // console.error('Error inserting data:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json({ message: 'Data  successfully' });
    });
});











// Function to create a table
function createTable(projectId, columnNames) {
    const tableName = `project_${projectId}`;
    let columns = columnNames.map(name => `${name} TEXT`).join(', ');
    columns += ", timestamp DATETIME DEFAULT CURRENT_TIMESTAMP"; // Adding a timestamp column

    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;

    db.run(createTableSQL, (err) => {
        if (err) {
            // console.error(`Error creating table ${tableName}:`, err.message);
        } else {
            // console.log(`Table ${tableName} created successfully.`);
        }
    });
}













// Route to create a project and its corresponding table
router.post('/create', auth, async (req, res) => {
    try {
        const owner = await Users.findById(req.user.id);

        const { projectName, description, mode, numOfColumns, columnNamesdata } = req.body;
        const newProject = new Project({ projectName, description, mode, owner, numOfColumns, columnNames: columnNamesdata });
        await newProject.save();

        // console.log('Project created, initiating table creation...');

        // Create a corresponding SQLite table
        createTable(newProject._id, columnNamesdata);

        res.status(200).json({ message: 'Project created successfully', projectId: newProject._id });
    } catch (error) {
        // console.error('Error creating project:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to fetch a list of projects for the authenticated user
router.get('/list', auth, async (req, res) => {
    try {
        // console.log("Fetching project list for user:", req.user.id);

        const projects = await Project.find({ owner: req.user.id }).select('projectName');
        res.json({ projects });
    } catch (error) {
        // console.error("Error fetching project list:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Route to fetch project details by ID
router.get('/view/:id', auth, async (req, res) => {
    try {
        // console.log("Fetching project details for project ID:", req.params.id);

        const projectId = req.params.id;
        const project = await Project.findById(projectId).populate('owner', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        // console.error("Error fetching project data:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to fetch table data
router.get('/table/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const tableName = `project_${projectId}`;

    // console.log(`Fetching data from table ${tableName}`);

    const query = `SELECT * FROM ${tableName}`;

    db.all(query, (err, rows) => {
        if (err) {
            // console.error('Error fetching table data:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }
        console.log('Fetched data:', rows);
        res.json({ rows });
    });
});

// Endpoint to fetch table data for chart
router.get('/chart/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const tableName = `project_${projectId}`;
  
    const query = `SELECT * FROM ${tableName}`;
    db.all(query, [], (err, rows) => {
      if (err) {
        // console.error('Error fetching table data:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      res.json({ rows });
    });
  });
  

// Endpoint to fetch column names for the table
router.get('/columns/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const tableName = `project_${projectId}`;

    // console.log(`Fetching column names for table ${tableName}`);

    const query = `PRAGMA table_info(${tableName})`;

    db.all(query, (err, rows) => {
        if (err) {
            // console.error('Error fetching column names:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }
        const columns = rows.map(row => row.name);
        // console.log('Fetched columns:', columns);
        res.json({ columns });
    });
});

module.exports = router;
