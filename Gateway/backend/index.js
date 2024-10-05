require('dotenv').config()
const express = require('express')
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db'); // Adjust the path to your database file

const mqtt = require('mqtt');
const mongoose = require('mongoose')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')


// MQTT setup
const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Adjust to your MQTT broker's address

// When connected to the MQTT broker
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


// Handling incoming messages
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
    }
    // Handling data received from a MAC address




    else if (topicParts.length === 3 && topicParts[0] === 'mac' && topicParts[2] === 'data') {
        const macAddress = topicParts[1]; // Extract the MAC address from the topic
        const data = JSON.parse(message.toString()); // Parse the incoming data
        console.log(`Received data for MAC address ${macAddress}:`, data);
    
        try {
            // Retrieve the table name associated with the given MAC address
            const getProjectTableQuery = `SELECT tableName FROM macaddressTable WHERE macAddress = ?`;
            db.get(getProjectTableQuery, [macAddress], (err, row) => {
                if (err) {
                    console.error('Error retrieving project table name:', err.message);
                    return;
                }
    
                if (row) {
                    const tableName = row.tableName;
    
                    // Check if the table exists and retrieve its column names
                    const getColumnNamesQuery = `PRAGMA table_info(${tableName})`;
                    console.log(`Fetching columns for table: ${tableName}`);
    
                    db.all(getColumnNamesQuery, [], (err, columnsInfo) => {
                        if (err) {
                            console.error('Error retrieving column names:', err.message);
                            return;
                        }
    
                        console.log(`Columns found in ${tableName}:`, columnsInfo);
    
                        if (columnsInfo.length === 0) {
                            // No columns found, create the table with at least one default column
                            console.warn(`No columns found for ${tableName}. Attempting to create the table...`);
    
                            const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (value1 TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`;
                            db.run(createTableQuery, (err) => {
                                if (err) {
                                    console.error(`Error creating table ${tableName}:`, err.message);
                                    return;
                                }
    
                                console.log(`Table ${tableName} created with default columns.`);
                            });
                            return;
                        }
    
                        // Filter out the `timestamp` column if it exists
                        const columns = columnsInfo.map(col => col.name).filter(col => col !== 'timestamp');
    
                        if (columns.length === 0) {
                            console.error(`No valid columns found in table ${tableName} to insert data.`);
                            return;
                        }
    
                        // Assuming the incoming data is a single value, use the first column for it
                        const columnName = columns[0]; // Use the first column as the destination column
                        const insertQuery = `INSERT INTO ${tableName} (${columnName}) VALUES (?)`;
    
                        console.log(`Constructed INSERT query: ${insertQuery} with value: ${data}`);
    
                        // Execute the INSERT query with the single value
                        db.run(insertQuery, [data], (err) => {
                            if (err) {
                                console.error(`Error inserting data into ${tableName}:`, err.message);
                            } else {
                                console.log(`Data inserted successfully into ${tableName}: ${data}`);
                            }
                        });
                    });
                } else {
                    console.warn(`No table found for MAC address: ${macAddress}`);
                }
            });
        } catch (error) {
            console.error('Error handling data for MAC address:', error);
        }
    }
    
    










    else{
        console.log("starting errror ")
    }
});


const app = express()
app.use(cookieParser())
app.use(fileUpload({useTempFiles:true}))
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend origin
    credentials: true // Allow credentials (cookies, authorization headers)
}));

//connect to mongodb
mongoose.connect(process.env.MONGODB_URI,  err =>{
    if(err) throw err;
    console.log('CONNECTED  TO MONGODB')
}
)

//Router
app.use('/customer',require('./router/cutomer'))
app.use('/user',require('./router/userRouter'))
app.use('/project',require('./router/ProjectRouter'))


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



app.get('/',function(req,res)
{
   
    res.json({msg:"welcome to server"})
})
app.listen(process.env.PORT,err=>{
    console.log('Server running')
    
})

 


function macaddtable() {
  const tableName = `macaddressTable`; // Name of the table where we store MAC addresses and metadata

  // Defining columns for the table: macAddress, tableName, userId, and timestamp
  const columns = `
    macAddress TEXT PRIMARY KEY, 
    userid TEXT NOT NULL,
    projectid TEXT NOT NULL,
    tableName TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  `;

  // Create the table if it doesn't exist
  const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;

  // Execute the SQL command to create the table
  db.run(createTableSQL, (err) => {
    if (err) {
      console.error(`Error creating table ${tableName}:`, err.message);
    } else {
      console.log(`Table ${tableName} created successfully.`);
    }
  });
}
function ipaddtable() {
    const tableName = `ipaddtable`; // Name of the table where we store IP addresses and metadata

    // Defining columns for the table and adding a unique constraint on (ip, projectid)
    const columns = `
        ip TEXT NOT NULL,
        userid TEXT NOT NULL,
        projectid TEXT NOT NULL,
        tableName TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (ip, projectid)  -- Composite primary key to enforce uniqueness
    `;

    // Create the table if it doesn't exist
    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;

    // Execute the SQL command to create the table
    db.run(createTableSQL, (err) => {
        if (err) {
            console.error(`Error creating table ${tableName}:`, err.message);
        } else {
            console.log(`Table ${tableName} created successfully.`);
        }
    });
}

// Call the function to create the table
macaddtable();
ipaddtable();