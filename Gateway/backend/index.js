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
  mqttClient.subscribe('+/+/data', (err) => {
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
  if (topicParts.length === 3 && topicParts[0] === 'project' && topicParts[2] === 'data') {
    const projectId = topicParts[1];
    const data = JSON.parse(message.toString());

    const tableName = `project_${projectId}`;
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

    db.run(query, values, function (err) {
      if (err) {
        console.error(`Failed to insert data for project ${projectId}:`, err.message);
      } else {
        console.log(`Data inserted successfully into project_${projectId}`);
      }
    });
  } else {
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

// Call the function to create the file table
// Call the functions to create the tables
macaddtable();
ipaddtable();
createFileTable();


// MongoDB connection setup
const uri = 'mongodb://root:password@localhost:27017/admin';
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
// Home route
app.get('/', (req, res) => {
  res.json({ msg: "Welcome to the server" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
