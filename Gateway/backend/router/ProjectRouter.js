const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db'); // Adjust the path to your database file
const Users = require('../modules/customerModel');
const Project = require('../modules/projectModel');
const auth = require('../middleware/auth');
const { Query } = require('mongoose');
const axios = require('axios'); // Make sure to require axios at the top of your file
const { exec } = require('child_process');

const path = require('path');
const fs = require('fs');

const { Parser } = require('json2csv');

const multer = require('multer');

// Serve static files from the 'codes' directory
// Serve static files from the 'codes' directory

























// Set up multer for file uploads
// const upload = multer({
//     dest: path.join(__dirname, '../codes'), // Temporary destination
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype !== 'text/x-python-script') {
//             return cb(new Error('Only .py files are allowed'), false);
//         }
//         cb(null, true);
//     }
// });


// Route to upload a .py file and store it in the 'codes' folder

const upload = multer({ dest: 'uploads/' }); // Set your preferred directory

router.post('/upload_python', upload.single('pythonFile'), (req, res) => {
    console.log('--- File Upload Endpoint Hit ---');
    console.log('Request received at:', new Date().toISOString());

    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File details:', req.file);

    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, '../codes', req.file.originalname);

    fs.rename(tempPath, targetPath, (err) => {
        if (err) {
            console.error('Error moving file:', err);
            return res.status(500).json({ message: 'Error saving file', error: err.message });
        }
        res.json({ message: 'File uploaded successfully', location: `/codes/${req.file.originalname}` });
    });
});















































router.use('/images', (req, res, next) => {
    const staticPath = path.join(__dirname, '../codes');
    console.log(`Serving static files from: ${staticPath}`);

    // This middleware serves static files
    express.static(staticPath)(req, res, (err) => {
        if (err) {
            console.error(`Error serving file: ${err}`);
            return res.status(500).send('Error while serving static file.');
        }
        next();  // Proceed to the next middleware if no error
    });
});


// Endpoint to run the Python script and return image URLs or other outputs
// Endpoint to run the Python script and return image URLs or other outputs
router.get('/python', (req, res) => {
    let outputList = [];  // Initialize the output list
    console.log("python code is running")

    // Run the Python script
    exec('python3 codes/1.py', (error, stdout, stderr) => {
        if (error) {
            console.error('Error executing the Python script:', error);
            return res.status(500).json({ message: 'Error executing Python script', error: error.message });
        }
        if (stderr) {
            console.error('Python script stderr:', stderr);
            return res.status(500).json({ message: 'Python script error', error: stderr });
        }

        try {
            // Parse the JSON output from the Python script
            const jsonData = JSON.parse(stdout.trim());

            // Check if the output contains graph and other data
            if (jsonData.outputs && jsonData.outputs.length > 0) {
                jsonData.outputs.forEach(output => {
                    if (output.type === 'graph') {
                        // Adjust the path for the image (relative to the static folder)
                        const imageUrl = `/images/${path.basename(output.location)}`;
                        output.location = imageUrl;
                        console.log(imageUrl);
                    }
                    outputList.push(output);
                });
            }

            // Return the output list as a JSON response
            res.json({ outputs: outputList });

        } catch (parseError) {
            console.error('Error parsing JSON from Python output:', parseError);
            return res.status(500).json({ message: 'Error parsing JSON from Python output', error: parseError.message });
        }
    });
});















// Function to fetch data and push to ThingSpeak
async function pushDataToThingSpeak(projectId) {
    try {
        // Step 1: Fetch the project details, including the API key and lastPushed timestamp
        const project = await Project.findById(projectId);
        if (!project) {
            console.error(`Project with ID ${projectId} not found.`);
            return;
        }

        const { apiKey, lastPushed } = project;
        console.log(`Using API Key: ${apiKey}, Last Pushed: ${lastPushed}`);

        const tableName = `project_${projectId}`;

        // Step 2: Fetch column names dynamically from the SQLite table
        const pragmaSQL = `PRAGMA table_info(${tableName});`;

        db.all(pragmaSQL, (err, columns) => {
            if (err) {
                console.error(`Error fetching columns for table ${tableName}:`, err.message);
                return;
            }

            const columnNames = columns
                .map(col => col.name)
                .filter(name => name !== 'timestamp'); // Exclude the timestamp column

            console.log(`Detected columns: ${columnNames.join(', ')}`);

            // Step 3: Query to fetch new rows since the lastPushed timestamp
            const selectSQL = `
                SELECT ${columnNames.join(', ')}, timestamp 
                FROM ${tableName} 
                WHERE timestamp > ? 
                ORDER BY timestamp ASC`;

            console.log(`Executing SQL: ${selectSQL}`);

            db.all(selectSQL, [lastPushed], async (err, rows) => {
                if (err) {
                    console.error(`Error reading from table ${tableName}:`, err.message);
                    return;
                }

                if (rows.length > 0) {
                    console.log(`Fetched ${rows.length} new rows from ${tableName}.`);

                    for (const [index, row] of rows.entries()) {
                        // Construct the ThingSpeak API URL
                        const fieldParams = columnNames.map((col, i) => `field${i + 1}=${row[col]}`).join('&');
                        const url = `https://api.thingspeak.com/update?api_key=${apiKey}&${fieldParams}`;

                        console.log(`Sending data to ThingSpeak: ${url}`);

                        try {
                            const response = await axios.get(url);
                            console.log(`Row ${index + 1}: Data sent successfully. Response: ${response.data}`);

                            // Update the lastPushed timestamp in the project
                            await Project.findByIdAndUpdate(projectId, { lastPushed: row.timestamp });
                        } catch (error) {
                            console.error(`Row ${index + 1}: Error sending data to ThingSpeak:`, error.message);
                        }
                    }
                } else {
                    console.log(`No new data found in table ${tableName}.`);
                }
            });
        });
    } catch (error) {
        console.error('Error pushing data to ThingSpeak:', error.message);
    }
}



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

router.get('/pushdata/:projectId', async (req, res) => {
    try {
        const projectId = req.params.projectId;
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }
        // const columns = ['data', 'humidity']; // List of columns to send

        pushDataToThingSpeak(projectId);

        res.sendStatus(200);
    } catch (error) {
        // console.error('Error fetching API URLs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// anlysis data 

// Analysis route: Execute instructions on project-specific tables

router.post('/analyze/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { instruction } = req.body;

    if (!projectId || !instruction) {
      return res.status(400).json({ message: 'Project ID and instruction are required' });
    }

    const tableName = `project_${projectId}`;
    console.log(`Using table: ${tableName}`);

    // Check if the table exists
    const checkTableSQL = `SELECT name FROM sqlite_master WHERE type='table' AND name=?`;
    db.get(checkTableSQL, [tableName], (err, row) => {
      if (err) {
        console.error(`Error checking table: ${err.message}`);
        return res.status(500).json({ message: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ message: `Table for project ${projectId} does not exist.` });
      }

      // Validate the instruction to ensure only SELECT operations are allowed
      const sql = instruction.replace('$table', tableName).trim();
      if (!sql.toUpperCase().startsWith('SELECT')) {
        return res.status(400).json({ message: 'Only SELECT instructions are allowed.' });
      }

      console.log(`Executing SQL: ${sql}`);

      // Execute the instruction
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error(`Error executing instruction: ${err.message}`);
          return res.status(400).json({ message: 'Invalid instruction', error: err.message });
        }
      
        console.log(`Instruction executed: ${sql}`);
        console.log('Query Result:', rows); // Add this line to log the result
      
        res.status(200).json({ message: 'Instruction executed successfully', data: rows });
      });
      
    });
  } catch (error) {
    console.error('Error processing instruction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});




































// Function to generate CSV content based on project and table data
function generateCSVContent(project, tableData) {
    const fields = project.columnNames; // Columns for CSV from project data
    fields.push('timestamp'); // Add timestamp as a column
    
    // Prepare the rows with appropriate column names
    const csvParser = new Parser({ fields });
    const csvContent = csvParser.parse(tableData);
    return csvContent;
}

// Route to download CSV for a specific project
router.get('/download/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;

        // Fetch project details from MongoDB
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Query SQLite database for table data
        const tableName = `project_${projectId}`;
        const query = `SELECT * FROM ${tableName}`;
        db.all(query, (err, rows) => {
            if (err) {
                console.error(`Error querying table ${tableName}:`, err.message);
                return res.status(500).json({ message: 'Error fetching table data' });
            }

            // Generate CSV content based on project and table data
            const csvContent = generateCSVContent(project, rows);

            // Set headers and send CSV content as a downloadable file
            res.setHeader('Content-Disposition', `attachment; filename="project_${projectId}.csv"`);
            res.setHeader('Content-Type', 'text/csv');
            res.send(csvContent);
        });
    } catch (error) {
        console.error('Error generating CSV file:', error);
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



// // Endpoint to insert data into a project table
// router.post('/insert/:projectId', async (req, res) => {
//     console.log(req)
//     const projectId = req.params.projectId;
//     const tableName = `project_${projectId}`;
//     const data = req.body; // Data to insert

//     // Construct the SQL query to insert data
//     const columns = Object.keys(data).map(key => `${key}`).join(', ');
//     const placeholders = Object.keys(data).map(() => '?').join(', ');
//     const values = Object.values(data);

//     const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

//     db.run(query, values, function(err) {
//         if (err) {
//             // console.error('Error inserting data:', err.message);
//             return res.status(500).json({ message: 'Server error' });
//         }
//         res.send();
//     });
// });














// IP filter endpoint to insert data into a project table
router.post('/insert/:projectId', (req, res) => {
    try {
        const projectId = req.params.projectId;
        const tableName = `project_${projectId}`;
        const requestIp = req.ip; // Get the request IP address


        // Log the incoming request details
        console.log(`Incoming request from IP: ${requestIp} for project table: ${tableName}`);

        // Step 1: Check if the request IP is present in the ipaddtable for the specified tableName
        const query = `SELECT ip FROM ipaddtable WHERE tableName = ?`;

        db.all(query, [tableName], (err, rows) => {
            if (err) {
                console.error(`Error retrieving IP addresses for table ${tableName}:`, err.message);
                return res.status(500).json({ message: 'Server error while verifying IP address.' });
            }

            // Step 2: Check if the request IP is in the list of allowed IPs for this table
            const allowedIps = rows.map(row => row.ip); // Extract IPs from the rows
            console.log(`Allowed IPs for table ${tableName}:`, allowedIps);

            if (allowedIps.includes(requestIp)) {
                // If IP address is found in the list, proceed to insert data
                console.log(`IP ${requestIp} is authorized to access table ${tableName}.`);

                const data = req.body; // Data to insert
console.log(data)
                if (Object.keys(data).length === 0) {
                    return res.status(400).json({ message: 'No data provided for insertion.' });
                }

                // Construct the SQL query to insert data
                const columns = Object.keys(data).join(', ');
                const placeholders = Object.keys(data).map(() => '?').join(', ');
                const values = Object.values(data);

                const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

                db.run(insertQuery, values, function (err) {
                    if (err) {
                        console.error(`Error inserting data into ${tableName}:`, err.message);
                        return res.status(500).json({ message: 'Server error while inserting data.' });
                    }

                    console.log(`Data inserted into table ${tableName} successfully.`);
                    return res.status(200).json({ message: 'Data inserted successfully.' });
                });
            } else {
                // If IP address is not found, respond with 403 Forbidden
                console.warn(`IP ${requestIp} is not authorized to access table ${tableName}.`);
                return res.status(403).json({ message: 'Unauthorized IP address for this project.' });
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Server error.' });
    }
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

        const { projectName, description,apiKey, mode, numOfColumns, columnNamesdata } = req.body;
        const newProject = new Project({ projectName, description,apiKey, mode, owner, numOfColumns, columnNames: columnNamesdata });
        await newProject.save();

        // console.log('Project created, initiating table creation...');

        // Create a corresponding SQLite table
        createTable(newProject._id,columnNamesdata);

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



// Route to add a new MAC address to a project
router.post('/addmac', auth, async (req, res) => {
    // console.log("*****************");
    const { macAddress, projectId } = req.body;
    const tableName = `project_${projectId}`;

    const owner = await Users.findById(req.user.id);
    const userid = owner.email;

    // console.log(macAddress, userid, projectId, tableName);

    // Check if required fields are present
    if (!macAddress || !userid || !projectId || !tableName) {
        return res.status(400).json({ message: 'macAddress, projectId, and other required fields are missing' });
    }

    // SQL query to insert MAC address and project details into macaddressTable
    const query = `INSERT INTO macaddressTable (macAddress, userid, projectid, tableName) VALUES (?, ?, ?, ?)`;
    db.run(query, [macAddress, userid, projectId, tableName], function (err) {
        if (err) {
            console.error('Error inserting MAC address to project:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }

        res.status(201).json({ message: 'MAC address added to project successfully' });
    });
});






// Route to get list of MAC addresses for a specific project
router.get('/:id/macs', async (req, res) => {
    console.log("**********");
    const projectId = req.params.id;
    const tableName = `project_${projectId}`;
    console.log(tableName);

    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
    }

    try {
        // SQL query to fetch MAC addresses associated with the project
        const query = `SELECT * FROM macaddressTable WHERE tableName = ?`;
        console.log(query);

        // Execute the query
        db.all(query, [tableName], (err, rows) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            console.log(rows);
            res.json(rows);
        });
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});






// Route to delete a MAC address from a project
router.delete('/:id/macs/:mac', auth, async (req, res) => {
    const projectId = req.params.id;
    const macAddress = req.params.mac;
    const tableName = `project_${projectId}`;

    if (!projectId || !macAddress) {
        return res.status(400).json({ message: 'Project ID and MAC address are required' });
    }

    try {
        // Delete MAC address from macaddressTable
        const query = `DELETE FROM macaddressTable WHERE macAddress = ? AND tableName = ?`;
        db.run(query, [macAddress, tableName], function (err) {
            if (err) {
                console.error('Error deleting MAC address:', err.message);
                return res.status(500).json({ message: 'Server error', error: err.message });
            }
            res.status(200).json({ message: 'MAC address deleted successfully' });
        });
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});













//ip tables 










// Route to add a new MAC address to a project
router.post('/addip', auth, async (req, res) => {
    // console.log("*****************");
    const { ip, projectId } = req.body;
    const tableName = `project_${projectId}`;
    
    const owner = await Users.findById(req.user.id);
    const userid = owner.email;

    // console.log(ip, userid, projectId, tableName);

    // Check if required fields are present
    if (!ip || !userid || !projectId || !tableName) {
        return res.status(400).json({ message: 'ip, projectId, and other required fields are missing' });
    }

    // SQL query to insert MAC address and project details into macaddressTable
    const query = `INSERT INTO ipaddtable (ip, userid, projectid, tableName) VALUES (?, ?, ?, ?)`;
    db.run(query, [ip, userid, projectId, tableName], function (err) {
        if (err) {
            console.error('Error inserting MAC address to project:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }

        res.status(201).json({ message: 'ip address added to project successfully' });
    });
});






// Route to get list of MAC addresses for a specific project
router.get('/:id/ip', async (req, res) => {
    console.log("**********");
    const projectId = req.params.id;
    const tableName = `project_${projectId}`;
    console.log(tableName);

    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
    }

    try {
        // SQL query to fetch MAC addresses associated with the project
        const query = `SELECT * FROM ipaddtable WHERE tableName = ?`;
        console.log(query);

        // Execute the query
        db.all(query, [tableName], (err, rows) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            console.log(rows);
            res.json(rows);
        });
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});






// Route to delete a MAC address from a project
router.delete('/:id/ip/:ip', auth, async (req, res) => {
    const projectId = req.params.id;
    const ip = req.params.ip;
    const tableName = `project_${projectId}`;

    if (!projectId || !ip) {
        return res.status(400).json({ message: 'Project ID and MAC address are required' });
    }

    try {
        // Delete MAC address from macaddressTable
        const query = `DELETE FROM ipaddtable WHERE ip = ? AND tableName = ?`;
        db.run(query, [ip, tableName], function (err) {
            if (err) {
                console.error('Error deleting MAC address:', err.message);
                return res.status(500).json({ message: 'Server error', error: err.message });
            }
            res.status(200).json({ message: 'MAC address deleted successfully' });
        });
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
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
