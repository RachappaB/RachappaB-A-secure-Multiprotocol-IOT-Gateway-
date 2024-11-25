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

const path = require('path');
const fs = require('fs');

const { Parser } = require('json2csv');

const multer = require('multer');

// XOR encryption function
function xorEncrypt(data, key) {
    let encryptedData = '';
    const keyLength = key.length;

    for (let i = 0; i < data.length; i++) {
        encryptedData += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % keyLength));
    }

    return Buffer.from(encryptedData).toString('base64'); // Convert encrypted data to Base64
}

// XOR decryption function
function xorDecrypt(data, key) {
    let decryptedData = '';
    const keyLength = key.length;

    const decodedData = Buffer.from(data, 'base64').toString(); // Decode Base64 to string

    for (let i = 0; i < decodedData.length; i++) {
        decryptedData += String.fromCharCode(decodedData.charCodeAt(i) ^ key.charCodeAt(i % keyLength));
    }
    return decryptedData;
}

// Fetch decryption/encryption key from ipaddtable
function getKeyFromDatabase(projectId, ip) {
    return new Promise((resolve, reject) => {
        const query = `SELECT key FROM ipaddtable WHERE projectid = ? AND ip = ?`;
        db.get(query, [projectId, ip], (err, row) => {
            if (err) {
                console.error('Error fetching key from database:', err.message);
                return reject('Error fetching key from database.');
            }
            if (!row) {
                return reject('No key found for the provided project and IP.');
            }
            resolve(row.key);
        });
    });
}

// Secure data insertion route
router.post('/secure-insert/:projectId', async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const tableName = `project_${projectId}`;
        const requestIp = req.ip; // Get the IP address of the request
        const encryptedData = req.body.encryptedData; // Encrypted data from the request
        console.log("DDDDDDDD")
        if (!encryptedData) {
            return res.status(400).json({ message: 'No encrypted data provided.' });
        }

        console.log(`Incoming request from IP: ${requestIp} for project table: ${tableName}`);
        console.log(`Received encrypted data: ${encryptedData}`);

        // Step 1: Fetch decryption key
        const decryptionKey = await getKeyFromDatabase(projectId, requestIp);

        // Step 2: Decrypt the incoming data
        const decryptedData = xorDecrypt(encryptedData, decryptionKey);
        console.log(`Decrypted data: ${decryptedData}`);

        // Step 3: Fetch the column names dynamically from the table
        const getColumnsQuery = `PRAGMA table_info(${tableName})`;
        db.all(getColumnsQuery, (err, columns) => {
            if (err) {
                console.error(`Error fetching table columns for ${tableName}:`, err.message);
                return res.status(500).json({ message: 'Server error while fetching table columns.' });
            }

            // Extract column names, excluding the 'timestamp' column
            const columnKeys = columns.map(col => col.name).filter(name => name !== 'timestamp');

            // Split the decrypted values
            const values = decryptedData.split(',');

            // Validate the number of values matches the number of columns
            if (values.length !== columnKeys.length) {
                return res.status(400).json({
                    message: 'Mismatch between number of values and table columns.',
                });
            }

            // Build the SQL query dynamically
            const columnsList = columnKeys.join(', ');
            const placeholders = columnKeys.map(() => '?').join(', ');
            const insertQuery = `INSERT INTO ${tableName} (${columnsList}) VALUES (${placeholders})`;

            // Insert data into the table
            db.run(insertQuery, values, function (insertErr) {
                if (insertErr) {
                    console.error(`Error inserting data into ${tableName}:`, insertErr.message);
                    return res.status(500).json({ message: 'Server error while inserting data.' });
                }

                console.log(`Data inserted into table ${tableName} successfully.`);
                return res.status(200).json({ message: 'Data inserted successfully.' });
            });
        });
    } catch (error) {
        console.error('Server error:', error.message);
        return res.status(500).json({ message: error });
    }
});

// Route to accept basic data and return encrypted JSON
router.post('/encrypt-data', async (req, res) => {
    try {
        const { projectId, values } = req.body; // Expecting projectId and array of values
        const requestIp = req.ip; // Get IP address of the request

        if (!Array.isArray(values)) {
            return res.status(400).json({ message: 'Invalid input. Expected an array of values.' });
        }

        // Fetch encryption key
        const encryptionKey = await getKeyFromDatabase(projectId, requestIp);

        // Join values into a comma-separated string for encryption
        const dataToEncrypt = values.join(',');

        // Encrypt the data
        const encryptedData = xorEncrypt(dataToEncrypt, encryptionKey);

        // Return the encrypted JSON
        res.status(200).json({ encryptedData });
    } catch (error) {
        console.error('Error encrypting data:', error.message);
        res.status(500).json({ message: error });
    }
});

module.exports = router;
