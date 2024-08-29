const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db'); // Adjust the path to your database file

const Users = require('../modules/customerModel');
const Project = require('../modules/projectModel');
const auth = require('../middleware/auth');

// Function to create a table
function createTable(projectId, columnNames) {
    const tableName = `project_${projectId}`;
    let columns = columnNames.map(name => `${name} TEXT`).join(', ');
    columns += ", timestamp DATETIME DEFAULT CURRENT_TIMESTAMP"; // Adding a timestamp column

    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;

    db.run(createTableSQL, (err) => {
        if (err) {
            console.error(`Error creating table ${tableName}:`, err.message);
        } else {
            console.log(`Table ${tableName} created successfully.`);
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

        console.log('Project created, initiating table creation...');

        // Create a corresponding SQLite table
        createTable(newProject._id, columnNamesdata);

        res.status(200).json({ message: 'Project created successfully', projectId: newProject._id });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to fetch a list of projects for the authenticated user
router.get('/list', auth, async (req, res) => {
    try {
        console.log("Fetching project list for user:", req.user.id);

        const projects = await Project.find({ owner: req.user.id }).select('projectName');
        res.json({ projects });
    } catch (error) {
        console.error("Error fetching project list:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Route to fetch project details by ID
router.get('/view/:id', auth, async (req, res) => {
    try {
        console.log("Fetching project details for project ID:", req.params.id);

        const projectId = req.params.id;
        const project = await Project.findById(projectId).populate('owner', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error("Error fetching project data:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to fetch table data
router.get('/table/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const tableName = `project_${projectId}`;

    console.log(`Fetching data from table ${tableName}`);

    const query = `SELECT * FROM ${tableName}`;

    db.all(query, (err, rows) => {
        if (err) {
            console.error('Error fetching table data:', err.message);
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
        console.error('Error fetching table data:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      res.json({ rows });
    });
  });
  

// Endpoint to fetch column names for the table
router.get('/columns/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const tableName = `project_${projectId}`;

    console.log(`Fetching column names for table ${tableName}`);

    const query = `PRAGMA table_info(${tableName})`;

    db.all(query, (err, rows) => {
        if (err) {
            console.error('Error fetching column names:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }
        const columns = rows.map(row => row.name);
        console.log('Fetched columns:', columns);
        res.json({ columns });
    });
});

module.exports = router;
