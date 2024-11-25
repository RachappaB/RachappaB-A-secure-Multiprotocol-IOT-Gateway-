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
const os = require('os');
require('dotenv').config();
const mqtt = require('mqtt');

const path = require('path');
const fs = require('fs');

const { Parser } = require('json2csv');

const multer = require('multer');




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
router.post('/upload/:projectId', upload.single('file'), (req, res) => {
    try {
        const { projectId } = req.params;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const tableName = 'fileTable';
        const originalFileName = req.file.originalname; // Original file name
        const storedFileName = req.file.filename; // Name stored in the server
        const fileAddress = req.file.path; // Path where the file is stored
        const fileDetails = req.file.mimetype; // MIME type of the file

        // Insert file details into the fileTable
        const insertQuery = `
            INSERT INTO ${tableName} (projectId, originalFileName, storedFileName, fileAddress, fileDetails) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [projectId, originalFileName, storedFileName, fileAddress, fileDetails];

        db.run(insertQuery, values, function (err) {
            if (err) {
                console.error(`Error inserting file details into ${tableName}:`, err.message);
                return res.status(500).json({ message: 'Server error while saving file details.' });
            }

            console.log(`File details inserted into ${tableName} successfully.`);
            res.status(200).json({
                message: 'File uploaded and details saved successfully.',
                fileDetails: {
                    id: this.lastID, // ID of the inserted row
                    projectId,
                    originalFileName,
                    storedFileName,
                    fileAddress,
                    fileDetails
                }
            });
        });
    } catch (error) {
        console.error('Error in upload route:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
});





router.get('/files/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required.' });
        }

        const tableName = 'fileTable';
        const query = `SELECT id,originalFileName, storedFileName, fileAddress, fileDetails FROM ${tableName} WHERE projectId = ?`;

        db.all(query, [projectId], (err, rows) => {
            if (err) {
                console.error(`Error fetching files for project ${projectId}:`, err.message);
                return res.status(500).json({ message: 'Server error while fetching files.' });
            }

            if (rows.length === 0) {
                return res.status(404).json({ message: 'No files found for the specified project.' });
            }

            // Respond with the list of files
            res.status(200).json({
                message: 'Files fetched successfully.',
                files: rows.map(row => ({
                    id : row.id,
                    originalFileName: row.originalFileName,
                    storedFileName: row.storedFileName,
                    fileAddress: row.fileAddress,
                    fileDetails: row.fileDetails
                }))
            });
        });
    } catch (error) {
        console.error('Error in fetch files route:', error.message);
        res.status(500).json({ message: 'Server error.' });
    }
});


















// MQTT Configuration// MQTT Configuration
const mqttClient = mqtt.connect('mqtt://localhost:1883'); // Replace with your MQTT broker address
const MQTT_BASE_TOPIC = 'project/results'; // Base topic for publishing results

// Route to run the script (Python or JavaScript) and publish results
router.get('/run-script-mqtt/:id', (req, res) => {
    const fileId = req.params.id; // Get the file ID from the request URL
console.log("JJJJJJJJJJJJJJJJJJJJJJJJJJJJ")
    // Fetch file details from the database based on the provided file ID
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
            command = `python3 ${scriptPath} '${JSON.stringify(row)}'`; // For Python scripts
        } else if (scriptPath.endsWith('.js')) {
            command = `node ${scriptPath} '${JSON.stringify(row)}'`; // For JavaScript scripts
        } else {
            return res.status(400).json({ error: 'Unsupported file type. Only .py and .js files are allowed.' });
        }

        // Execute the script
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error.message}`);
                return res.status(500).json({ error: 'Error executing script', details: stderr });
            }

            try {
                // Parse the script output (expected to be JSON)
                const output = JSON.parse(stdout);

                // Construct the MQTT topic and payload
                const mqttTopic = `${MQTT_BASE_TOPIC}/${row.projectId}/${fileId}`; // Unique topic for the file
                const mqttPayload = JSON.stringify({ fileId, output });

                // Publish the result to the MQTT topic
                mqttClient.publish(mqttTopic, mqttPayload, (err) => {
                    if (err) {
                        console.error('MQTT publish error:', err.message);
                        return res.status(500).json({ error: 'Failed to publish result via MQTT' });
                    }

                    console.log(`Published result to MQTT topic: ${mqttTopic}`);
                    res.json({ message: 'Script executed and result published', output });
                });
            } catch (parseError) {
                console.error('Error parsing script output:', parseError);
                res.status(500).json({ error: 'Error parsing script output' });
            }
        });
    });
});




// Route to run the Python script based on the file ID
router.get('/run-python/:id', (req, res) => {
    const fileId = req.params.id;  // Get the file ID from the request URL

    // Fetch file details from the database based on the provided file ID
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

        // Define the path to your Python script using the stored file name
        const pythonScriptPath = path.join(__dirname, '../uploads', storedFileName);

        // Ensure the Python file exists and can be executed
        if (!pythonScriptPath.endsWith('.py')) {
            return res.status(400).json({ error: 'Invalid Python script file' });
        }

        // Pass the file details to the Python script as JSON
        const fileDetails = JSON.stringify(row);  // This converts the file row into a JSON string

        // Run the Python script using exec
        exec(`python3 ${pythonScriptPath} '${fileDetails}'`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).json({ error: 'Error executing Python script', details: stderr });
            }

            // Log the Python script output
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);

            // Try to parse the output of the Python script (expected to be JSON)
            try {
                const output = JSON.parse(stdout);
                res.json(output); // Send the parsed JSON response back to the client
            } catch (parseError) {
                console.error(`Error parsing JSON: ${parseError}`);
                res.status(500).json({ error: 'Error parsing Python script output' });
            }
        });
    });
});

























function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const iface in interfaces) {
        for (const alias of interfaces[iface]) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1'; // Fallback to localhost
}
// Function to generate the ESP32 code dynamically
function generateESP32Code(serverUrl, columnNames) {
    const jsonData = columnNames.map(name => `"${name}":"value_for_${name}"`).join(', ');
    const jsonPayload = `{${jsonData}}`;

    return `
#include <WiFi.h>
#include <HTTPClient.h>

// Replace with your network credentials
const char* ssid = "${process.env.Your_SSID}";
const char* password = "${process.env.Your_PASSWORD}";

// URL for the API endpoint
const char* serverUrl = "${serverUrl}";

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("Connected to WiFi");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) { // Check if Wi-Fi is still connected
    // Create HTTPClient object
    HTTPClient http;
    
    // Specify request destination
    http.begin(serverUrl);
    
    // Specify content type
    http.addHeader("Content-Type", "application/json");

    // Prepare data to be sent
    //String jsonData = "{\"a\":\"1\", \"b\":\"2\", \"c\":\"3\"}";
    //    String jsonData = "{\"Random_value\":\"" + String(randomValue) + "\"}";

    String jsonData = "${jsonPayload}";
    Serial.println("Sending data: " + jsonData);

    // Send POST request
    int httpResponseCode = http.POST(jsonData);
    
    // Check for successful response
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response Code: " + String(httpResponseCode));
      Serial.println("Response Body: " + response);
    } else {
      Serial.println("Error on HTTP request");
    }

    // End HTTP request
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }

  // Wait for 1 second before sending the next value
  delay(1000);
}
    `;
}

// Route to generate and download the ESP32 code file
//'/:id/download/:mac'
router.get('/:id/download/:mac', async (req, res) => {
    const { id } = req.params;
    console.log("e")
    const projectId = id
    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required.' });
    }

    try {
        // Fetch project details
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const { columnNames } = project;
        const localIP = getLocalIPAddress();
        const serverUrl = `http://${localIP}:3001/project/insert/${projectId}`;

        // Generate the ESP32 code dynamically
        const esp32Code = generateESP32Code(serverUrl, columnNames);

        const filePath = path.join(__dirname, `../uploads/ESP32_Project_${projectId}.ino`);
        fs.writeFileSync(filePath, esp32Code);

        // Download the generated file
        res.download(filePath, `ESP32_Project_${projectId}.ino`, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                return res.status(500).send('Failed to generate file.');
            }

            try {
                fs.unlinkSync(filePath);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        });
    } catch (error) {
        console.error('Error generating .ino file:', error.message);
        res.status(500).json({ error: 'Failed to generate .ino file.' });
    }
});








































































function generateMQTTCode(mqttServer, topic, columnNames) {
    // Join the column names with commas and create the values string
    const columns = columnNames.join(','); // 'a,b,c'
    const values = columnNames.map(col => `"${col}": 1`).join(','); // '"a": 1, "b": 1, "c": 1'

    // Return the C++ code with dynamic content
    return `
#include <WiFi.h>
#include <PubSubClient.h>

// Replace with your network credentials
const char* ssid = "${process.env.Your_SSID}";
const char* password = "${process.env.Your_PASSWORD}";

// MQTT broker details
const char* mqttServer = "192.168.1.8";  // Your MQTT broker address
const int mqttPort = 1883;                 // MQTT port

WiFiClient espClient;
PubSubClient client(espClient);

// MQTT topic and message
const char* topic = "${topic}";  // Define your topic here

// Create dynamic message based on columns and values
//String message = "{\"a\": 1, \"b\": 1, \"c\": 1, \"d\": 1, \"e\": 1}";  // Create dynamic message
// use \ this line

String message = "{\"" + ${columns} + "\": {" + ${values} + "}}";  // Create dynamic message

void setup() {
  // Start serial communication
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("Connected to WiFi");

  // Set up MQTT client
  client.setServer(mqttServer, mqttPort);
}

void reconnect() {
  // Loop until reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");

    // Try to connect
    if (client.connect("ESP32Client")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void loop() {
  // Ensure the client is connected to the MQTT broker
  if (!client.connected()) {
    reconnect();
  }

  client.loop();  // Keep the MQTT connection alive

  // Publish data to MQTT topic
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Sending MQTT message...");
    client.publish(topic, message.c_str());
    Serial.println("Message sent!");
  }

  delay(1000);  // Delay between each publish
}
    `;
}


// Route to generate and download the MQTT code file
router.get('/:id/download/mqtt/:mac', async (req, res) => {
    const { id } = req.params;
    console.log("mqtt");
    
    const projectId = id;
    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required.' });
    }

    try {
        // Fetch project details
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const { columnNames } = project;  // Assuming columnNames is an array of column names (e.g., ['a', 'b', 'c'])
        const localIP = getLocalIPAddress();
        const mqttServer = `mqtt://${localIP}:1883`;  // You can modify this to your specific MQTT server IP
        const topic = `project/${projectId}/data/0`;  // Topic will be based on the project ID

        // Generate MQTT code dynamically
        const mqttCode = generateMQTTCode(mqttServer, topic, columnNames);

        // Define file path for the generated code
        const filePath = path.join(__dirname, `../uploads/Project_${projectId}_MQTT.ino`);
        fs.writeFileSync(filePath, mqttCode);

        // Download the generated file
        res.download(filePath, `Project_${projectId}_MQTT.ino`, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                return res.status(500).send('Failed to generate file.');
            }

            // Cleanup: remove the file after download
            try {
                fs.unlinkSync(filePath);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        });
    } catch (error) {
        console.error('Error generating .ino file:', error.message);
        res.status(500).json({ error: 'Failed to generate .ino file.' });
    }
});






























































function generateMQTTwaitCode(mqttServer, projectid, columnNames) {
    // Validate inputs
    if (!mqttServer || !projectid || !Array.isArray(columnNames) || columnNames.length === 0) {
        throw new Error("Invalid inputs. Please provide a valid MQTT server, topic, and an array of column names.");
    }
    const columns = columnNames.join(','); // 'a,b,c'

    // Generate the columns and values for the MQTT message
    const values = columnNames.map(col => `"${col}": 1`).join(','); // '"a": 1, "b": 1, "c": 1'

    // Generate the C++ code
    return `
#include <WiFi.h>
#include <PubSubClient.h>
// Replace with your network credentials
const char* ssid = "${process.env.Your_SSID}";
const char* password = "${process.env.Your_PASSWORD}";

// MQTT broker details
const char* mqttServer = "192.168.1.8";  // Your MQTT broker address
const int mqttPort = 1883;                 // MQTT port


WiFiClient espClient;
PubSubClient client(espClient);

// Topics for subscribing and publishing
const char* subscribeTopic = "project/results/${projectid}/giveurfileid";
const char* publishTopic = "project/${projectid}/wait/giveurfileid";

// Message to publish
// Create dynamic message based on columns and values
//String message = "{\"a\": 1, \"b\": 1, \"c\": 1, \"d\": 1, \"e\": 1}";  // Create dynamic message

String message = "{\"" + ${columns} + "\": {" + ${values} + "}}";  // Create dynamic message


// Callback function for received messages
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Print the topic of the message
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");

  // Print the payload
  for (unsigned int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println(); // New line after the message
}

void reconnect() {
  // Loop until reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");

    // Try to connect
    if (client.connect("ESP32Client")) {
      Serial.println("connected");

      // Resubscribe to the topic after reconnecting
      client.subscribe(subscribeTopic);
      Serial.print("Subscribed to: ");
      Serial.println(subscribeTopic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  // Start serial communication
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");

  // Set up MQTT client
  client.setServer(mqttServer, mqttPort);
  client.setCallback(mqttCallback); // Set the callback function for received messages

  // Connect to MQTT broker
  reconnect();
}

void loop() {
  // Ensure the client is connected to the MQTT broker
  if (!client.connected()) {
    reconnect();
  }

  client.loop(); // Keep the MQTT connection alive

  // Publish data to MQTT topic every 5 seconds
  static unsigned long lastPublish = 0;
  unsigned long now = millis();
  if (now - lastPublish > 5000) {
    Serial.println("Publishing message...");
    client.publish(publishTopic, message.c_str());
    Serial.println("Message published!");
    lastPublish = now;
  }
}
  `;
}



// Route to generate and download the MQTT code file
router.get('/:id/download/mqttwait/:mac', async (req, res) => {
    const { id } = req.params;
    console.log("mqtt");
    
    const projectId = id;
    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required.' });
    }

    try {
        // Fetch project details
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const { columnNames } = project;  // Assuming columnNames is an array of column names (e.g., ['a', 'b', 'c'])
        const localIP = getLocalIPAddress();
        const mqttServer = `mqtt://${localIP}:1883`;  // You can modify this to your specific MQTT server IP
        const topic = `project/${projectId}/data/0`;  // Topic will be based on the project ID

        // Generate MQTT code dynamically
        const mqttCode = generateMQTTwaitCode(mqttServer, projectId, columnNames);

        // Define file path for the generated code
        const filePath = path.join(__dirname, `../uploads/Project_${projectId}_MQTT.ino`);
        fs.writeFileSync(filePath, mqttCode);

        // Download the generated file
        res.download(filePath, `Project_${projectId}_MQTT.ino`, (err) => {
            if (err) {
                console.error('Error sending file:', err);
                return res.status(500).send('Failed to generate file.');
            }

            // Cleanup: remove the file after download
            try {
                fs.unlinkSync(filePath);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        });
    } catch (error) {
        console.error('Error generating .ino file:', error.message);
        res.status(500).json({ error: 'Failed to generate .ino file.' });
    }
});















































// Route to download a secure .ino file for a project and MAC address
router.get('/:projectId/download-secure/:mac', (req, res) => {
    const { projectId, mac } = req.params;

    // SQL query to fetch the key from ipaddtable based on the given projectId and mac
    const query = `SELECT key FROM ipaddtable WHERE ip = ? AND projectid = ?`;

    db.get(query, [mac, projectId], (err, row) => {
        if (err) {
            console.error('Error fetching encryption key:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }

        if (!row) {
            return res.status(404).json({ message: 'IP address not found or does not match the project ID' });
        }

        const encryptionKey = row.key;  // Get the encryption key from the database

        // Generate .ino file content
        const inoContent = `
#include <WiFi.h>
#include <HTTPClient.h>
#include "Base64.h"

// Replace with your network credentials
const char* ssid = "Rachappa";
const char* password = "shantappa9945483471";

// Replace with your server details
const char* serverUrl = "http://192.168.1.8:3001/wifisendcrptic/secure-insert/${projectId}";

// Encryption key
const char* encryptionKey = "${encryptionKey}";

// XOR Encryption function
String xorEncrypt(const String& data, const String& key) {
    String encryptedData = "";
    int keyLength = key.length();

    for (int i = 0; i < data.length(); i++) {
        encryptedData += (char)(data[i] ^ key[i % keyLength]);
    }

    char mutableData[encryptedData.length() + 1];
    strcpy(mutableData, encryptedData.c_str());
    size_t outputLength = Base64.encodedLength(encryptedData.length());
    char encodedData[outputLength];
    Base64.encode(encodedData, mutableData, encryptedData.length());
    return String(encodedData);
}

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
    }
    Serial.println("WiFi connected.");
}

void loop() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        String data = "25.5,60,1013"; // Example data
        String encryptedData = xorEncrypt(data, encryptionKey);
        String jsonPayload = "{\"encryptedData\":\"" + encryptedData + "\"}";
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");
        int httpResponseCode = http.POST(jsonPayload);
        http.end();
    }
    delay(5000);
}
`;

        const fileName = `ESP32_${mac}_secure.ino`;
        const filePath = path.join(__dirname, fileName);

        // Write the content to a temporary file
        fs.writeFileSync(filePath, inoContent);

        // Send the file to the client
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Error sending the file:', err);
            }
            // Clean up the temporary file after sending
            fs.unlinkSync(filePath);
        });
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
    const baseUrl1 = 'http://localhost:3001/wifisendcrptic';

    return {
        writesecureurl:`${baseUrl1}/secure-insert/${projectId}`,
        writeUrl: `${baseUrl}/insert/${projectId}`, // Endpoint to insert data
        limitUlr: `${baseUrl}/table/rows/${projectId}?limit=10&from=top`,
        readUrl: `${baseUrl}/table/${projectId}`   ,// Endpoint to read data
        readsecureurl: `${baseUrl1}/secure-insert/${projectId}`

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
















































router.post('/insert-and-run/:projectId/:fileId', (req, res) => {
    try {
        const projectId = req.params.projectId;
        const fileId = req.params.fileId;
        const tableName = `project_${projectId}`;
        const requestIp = req.ip; // Get the request IP address

        console.log(`Incoming request from IP: ${requestIp} for project table: ${tableName} and file ID: ${fileId}`);

        // Step 1: Verify the IP address
        const ipQuery = `SELECT ip FROM ipaddtable WHERE tableName = ?`;
        db.all(ipQuery, [tableName], (err, rows) => {
            if (err) {
                console.error(`Error retrieving IP addresses for table ${tableName}:`, err.message);
                return res.status(500).json({ message: 'Server error while verifying IP address.' });
            }

            const allowedIps = rows.map(row => row.ip);
            console.log(`Allowed IPs for table ${tableName}:`, allowedIps);

            if (allowedIps.includes(requestIp)) {
                // Step 2: Insert data into the project table
                const data = req.body;
                if (Object.keys(data).length === 0) {
                    return res.status(400).json({ message: 'No data provided for insertion.' });
                }

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

                    // Step 3: Verify the file belongs to the same project and run the script
                    const fileQuery = `SELECT * FROM fileTable WHERE id = ? AND projectId = ?`;
                    db.get(fileQuery, [fileId, projectId], (err, row) => {
                        if (err) {
                            console.error('Database error:', err.message);
                            return res.status(500).json({ error: 'Error retrieving file details' });
                        }

                        if (!row) {
                            return res.status(404).json({ error: 'File not found or not associated with this project.' });
                        }

                        const storedFileName = row.storedFileName;
                        const pythonScriptPath = path.join(__dirname, '../uploads', storedFileName);

                        if (!pythonScriptPath.endsWith('.py')) {
                            return res.status(400).json({ error: 'Invalid Python script file' });
                        }

                        // Step 4: Ensure the output directory exists
                        const outputDir = path.join(__dirname, `../outputs/project_${projectId}`);
                        if (!fs.existsSync(outputDir)) {
                            fs.mkdirSync(outputDir, { recursive: true });
                        }

                        // Run the Python script and save the output
                        const fileDetails = JSON.stringify(row);
                        const command = `python3 ${pythonScriptPath} '${fileDetails}'`;
                        exec(command, (error, stdout, stderr) => {
                            if (error) {
                                console.error(`exec error: ${error}`);
                                return res.status(500).json({ error: 'Error executing Python script', details: stderr });
                            }

                            try {
                                const output = JSON.parse(stdout);
                                const outputFile = path.join(outputDir, `output_${Date.now()}.json`);
                                fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

                                console.log(`Python script executed successfully. Output saved to ${outputFile}`);
                                return res.status(200).json({
                                    message: 'Data inserted and Python script executed successfully.',
                                    scriptOutput: output
                                });
                            } catch (parseError) {
                                console.error(`Error parsing JSON: ${parseError}`);
                                return res.status(500).json({ error: 'Error parsing Python script output' });
                            }
                        });
                    });
                });
            } else {
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






// Route to add a new MAC address to a project
router.post('/addmac', auth, async (req, res) => {
    const { macAddress, projectId } = req.body;
    const tableName = `project_${projectId}`;

    const owner = await Users.findById(req.user.id);
    const userid = owner.email;

    // Check if required fields are present
    if (!macAddress || !userid || !projectId || !tableName) {
        return res.status(400).json({ message: 'macAddress, projectId, and other required fields are missing' });
    }

    // Generate a random key
    const key = randomGenerateKey();

    // SQL query to insert data into macaddressTable
    const query = `
        INSERT INTO macaddressTable (macAddress, userid, projectid, tableName, key)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.run(query, [macAddress, userid, projectId, tableName, key], function (err) {
        if (err) {
            console.error('Error inserting MAC address:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }

        res.status(201).json({ message: 'MAC address added successfully', key });
    });
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








// Function to generate a random 20-character key
function randomGenerateKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}











// Route to add a new IP address to a project
router.post('/addip', auth, async (req, res) => {
    const { ip, projectId } = req.body;
    const tableName = `project_${projectId}`;

    const owner = await Users.findById(req.user.id);
    const userid = owner.email;

    // Check if required fields are present
    if (!ip || !userid || !projectId || !tableName) {
        return res.status(400).json({ message: 'ip, projectId, and other required fields are missing' });
    }

    // Generate a random key
    const key = randomGenerateKey();

    // SQL query to insert data into ipaddtable
    const query = `INSERT INTO ipaddtable (ip, userid, projectid, tableName, key) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [ip, userid, projectId, tableName, key], function (err) {
        if (err) {
            console.error('Error inserting IP address to project:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }

        res.status(201).json({ message: 'IP address added to project successfully', key });
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

    const query = `SELECT * FROM ${tableName} `;

    db.all(query, (err, rows) => {
        if (err) {
            // console.error('Error fetching table data:', err.message);
            return res.status(500).json({ message: 'Server error' });
        }
        console.log('Fetched data:', rows);
        res.json({ rows });
    });
});

// Endpoint to fetch the last 20 rows for chart
router.get('/chart/:projectId', async (req, res) => {
    const projectId = req.params.projectId;
    const tableName = `project_${projectId}`;
  
    // Fetch the last 20 rows based on the timestamp or id column
    const query = `SELECT * FROM ${tableName} `; // Assuming 'timestamp' column exists
  
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching table data:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
  
      // Reverse rows to display oldest first in the chart
      const reversedRows = rows.reverse();
  
      res.json({ rows: reversedRows });
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
