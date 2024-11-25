// Import required modules
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db'); // Adjust the path to your database file
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const { exec } = require('child_process');
const os = require('os');
require('dotenv').config();


const { Parser } = require('json2csv');

const { table } = require('console');

// Initialize the express app
const app = express();
const port = process.env.PORT || 3001;

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a unique timestamp to the file name
  }
});

const upload = multer({ storage: storage });

// Create 'uploads' directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}















// MQTT setup
const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Adjust to your MQTT broker's address

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('project/+/+/+', (err) => {
    if (err) {
      console.error('Failed to subscribe to topic', err.message);
    } else {
      console.log('Subscribed to project data topics');
    }
  });
});

// Handling incoming MQTT messages
mqttClient.on('message', async (topic, message) => {
  const topicParts = topic.split('/');
  // Ensure the topic follows the structure 'project/{projectId}/data'

  if (topicParts.length === 4 && topicParts[0] === 'project' && topicParts[2] === 'data' ) {
    const projectId = topicParts[1];  // Extract project ID from the topic
    const data = JSON.parse(message.toString());  // Parse the message to get the data

    // Assuming the data is an object with key-value pairs, like: { "a": 1, "b": 1, "c": 1 }
    const tableName = `project_${projectId}`; // Dynamically set the table name based on project ID
    console.log(tableName)
    const columns = Object.keys(data).join(', '); // Join column names (e.g., "a, b, c")
    const placeholders = Object.keys(data).map(() => '?').join(', '); // Create placeholders for the values (e.g., "?, ?, ?")
    console.log(placeholders)
    const values = Object.values(data);  // Get the values from the data object (e.g., [1, 1, 1])
    console.log(values)
    // Construct the SQL query for inserting data into the corresponding project table
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

    // Insert the data into the project table
    db.run(query, values, function (err) {
      if (err) {
        console.error(`Failed to insert data for project ${projectId}:`, err.message);
      } else {
        console.log(`Data inserted successfully into ${tableName}`);
      }
    });
  } // sending data and reciving data
  else if(topicParts.length === 4 && topicParts[0] === 'project' && topicParts[2] === 'wait'){
    const projectId = topicParts[1];  // Extract project ID from the topic
    const fileId = topicParts[3]; // Get the file ID from the request URL
    const data = JSON.parse(message.toString());  // Parse the message to get the data

    // Assuming the data is an object with key-value pairs, like: { "a": 1, "b": 1, "c": 1 }
    const tableName = `project_${projectId}`; // Dynamically set the table name based on project ID
    console.log(tableName)
    const columns = Object.keys(data).join(', '); // Join column names (e.g., "a, b, c")
    const placeholders = Object.keys(data).map(() => '?').join(', '); // Create placeholders for the values (e.g., "?, ?, ?")
    console.log(placeholders)
    const values = Object.values(data);  // Get the values from the data object (e.g., [1, 1, 1])
    console.log(values)
    // Construct the SQL query for inserting data into the corresponding project table
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

    // Insert the data into the project table
    db.run(query, values, function (err) {
      if (err) {
        console.error(`Failed to insert data for project ${projectId}:`, err.message);
      } else {
        console.log(`Data inserted successfully into ${tableName}`);
      }
    });
    db.get(`SELECT * FROM fileTable WHERE id = ?`, [fileId], (err, row) => {
      if (err) {
          console.error('Database error:', err.message);
          return res.status(500).json({ error: 'Error retrieving file details' });
      }

      if (!row) {
          return res.status(404).json({ error: 'File not found' });
      }

      // Extract the stored file name from the database row
      const storedFileName = row.storedFileName;

      // Define the path to the script file
      const scriptPath = path.join(__dirname, '../uploads', storedFileName);

      // Determine the script execution command based on the file extension
      let command;
      if (scriptPath.endsWith('.py')) {
          command = `python3 ${row.fileAddress} '${JSON.stringify(row)}'`; // For Python scripts
      } else if (scriptPath.endsWith('.js')) {
          command = `node ${scriptPath} '${JSON.stringify(row)}'`; // For JavaScript scripts
      } else {
          return res.status(400).json({ error: 'Unsupported file type. Only .py and .js files are allowed.' });
      }

      // Execute the script
      exec(command, (error, stdout, stderr) => {
          if (error) {
              console.error(`Execution error: ${error.message}`);
          }

          try {
              // Parse the script output (expected to be JSON)
              const output = JSON.parse(stdout);

              // Construct the MQTT topic and payload
              const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Replace with your MQTT broker address
const MQTT_BASE_TOPIC = 'project/results'; // Base topic for publishing results

              const mqttTopic = `${MQTT_BASE_TOPIC}/${projectId}/${fileId}`; // Unique topic for the file
              const mqttPayload = JSON.stringify({ fileId, output });

              // Publish the result to the MQTT topic
              mqttClient.publish(mqttTopic, mqttPayload, (err) => {
                  if (err) {
                      console.error('MQTT publish error:', err.message);
                  }

                  console.log(`Published result to MQTT topic: ${mqttTopic}`);
              });
          } catch (parseError) {
              console.error('Error parsing script output:', parseError);
          }
      });
  });


}
  
  else {
    console.log("Unhandled MQTT topic:", topic);
  }
});




























// Database table creation functions
function macaddtable() {
  const tableName = `macaddressTable`;
  const columns = `
    macAddress TEXT PRIMARY KEY, 
    userid TEXT NOT NULL,
    projectid TEXT NOT NULL,
    tableName TEXT NOT NULL,
        key TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  `;
  const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error(`Error creating table ${tableName}:`, err.message);
    } else {
      console.log(`Table ${tableName} created successfully.`);
    }
  });
}

function ipaddtable() {
  const tableName = `ipaddtable`;
  const columns = `
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT NOT NULL,
    userid TEXT NOT NULL,
    projectid TEXT NOT NULL,
    tableName TEXT NOT NULL,
    key TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  `;
  const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error(`Error creating table ${tableName}:`, err.message);
    } else {
      console.log(`Table ${tableName} created successfully.`);
    }
  });
}

function createFileTable() {
  const tableName = `fileTable`;
  const columns = `
      id INTEGER PRIMARY KEY AUTOINCREMENT,
            projectId TEXT NOT NULL,
            originalFileName TEXT NOT NULL,
            storedFileName TEXT NOT NULL,
            fileAddress TEXT NOT NULL,
            fileDetails TEXT NOT NULL
  `;
  const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;

  db.run(createTableSQL, (err) => {
      if (err) {
          console.error(`Error creating table ${tableName}:`, err.message);
      } else {
          console.log(`Table ${tableName} created successfully.`);
      }
  });
}




function createUserTable() {
  const tableName = `userTable`;
  const columns = `
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  `;
  const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;

  db.run(createTableSQL, (err) => {
      if (err) {
          console.error(`Error creating table ${tableName}:`, err.message);
      } else {
          console.log(`Table ${tableName} created successfully.`);
      }
  });
}

// Call the function to create the file table
// Call the functions to create the tables
macaddtable();
ipaddtable();
createFileTable();
createUserTable();

// MongoDB connection setup
const uri = 'mongodb+srv://rachappabiradar6:wrzlppnTE0h2RSXG@cluster0.mhswe.mongodb.net/';
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Middleware setup
app.use(cookieParser());
// app.use(fileUpload({ useTempFiles: true }));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend origin
  credentials: true
}));

// Serve static files (e.g., index.html)
app.use(express.static('public'));

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  res.send(`File uploaded successfully: ${req.file.filename}`);
});

// Token refresh endpoint
app.get('/user/refresh_token', (req, res) => {
  const rf_token = req.cookies.refreshtoken;
  if (!rf_token) return res.status(400).json({ message: 'Please login or register' });

  jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(400).json({ message: 'Invalid authentication' });
    const accesstoken = createAccessToken({ id: user.id });
    res.json({ accesstoken });
  });
});

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
};

// Route handling
app.use('/user', require('./router/userRouter'));
app.use('/project', require('./router/ProjectRouter'));
app.use('/customer',require('./router/cutomer'))
app.use('/wifisendcrptic',require('./router/Wifisendcrptic'))

// Home route
app.get('/', (req, res) => {
  res.json({ msg: "Welcome to the server" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
