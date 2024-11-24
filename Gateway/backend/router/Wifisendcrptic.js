const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db'); // Adjust the path to your database file

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



// Secure data insertion route
router.post('/secure-insert/:projectId', async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const tableName = `project_${projectId}`;
        const requestIp = req.ip; // Get the IP address of the request

        const encryptedData = req.body.encryptedData; // Encrypted data from the request
        const decryptionKey = 'GGWItCuXSPiOjmqVM3Px'; // Decryption key

        if (!encryptedData) {
            return res.status(400).json({ message: 'No encrypted data provided.' });
        }

        console.log(`Incoming request from IP: ${requestIp} for project table: ${tableName}`);
        console.log(`Received encrypted data: ${encryptedData}`);

        // Step 1: Decrypt the incoming data
        const decryptedData = xorDecrypt(encryptedData, decryptionKey);
        console.log(`Decrypted data: ${decryptedData}`);

        // Step 2: Fetch the column names dynamically from the table
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

            // Step 3: Validate the number of values matches the number of columns
            if (values.length !== columnKeys.length) {
                return res.status(400).json({
                    message: 'Mismatch between number of values and table columns.',
                });
            }

            // Step 4: Build the SQL query dynamically
            const columnsList = columnKeys.join(', ');
            const placeholders = columnKeys.map(() => '?').join(', ');
            const insertQuery = `INSERT INTO ${tableName} (${columnsList}) VALUES (${placeholders})`;

            // Step 5: Insert data into the table
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
        return res.status(500).json({ message: 'Server error.' });
    }
});





















// Route to accept basic data and return encrypted JSON
router.post('/encrypt-data', (req, res) => {
  try {
      const { values } = req.body; // Expecting an array of values
      const encryptionKey = 'GGWItCuXSPiOjmqVM3Px'; // Encryption key

      if (!Array.isArray(values)) {
          return res.status(400).json({ message: 'Invalid input. Expected an array of values.' });
      }

      // Join values into a comma-separated string for encryption
      const dataToEncrypt = values.join(',');

      // Encrypt the data
      const encryptedData = xorEncrypt(dataToEncrypt, encryptionKey);

      // Return the encrypted JSON
      res.status(200).json({ encryptedData });
  } catch (error) {
      console.error('Error encrypting data:', error.message);
      res.status(500).json({ message: 'Server error while encrypting data.' });
  }
});












module.exports = router;
