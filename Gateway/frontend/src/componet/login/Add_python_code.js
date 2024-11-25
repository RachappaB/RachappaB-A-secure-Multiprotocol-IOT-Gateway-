import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { GlobalState } from './Global';
import ListFiles from './ListFiles';

function FileUpload() {
  const state = useContext(GlobalState);
  const [token] = state.token;
  const { projectId } = useParams(); // Get the project ID from the URL
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // To handle success or error messages

  // Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      setMessageType('danger');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`/project/upload/${projectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(`File uploaded successfully: ${response.data.filename}`);
      setMessageType('success');
    } catch (error) {
      setMessage('Error uploading file');
      setMessageType('danger');
      console.error(error);
    }
  };

  // Handle file download
  const handleDownloadFormat = (format) => {
    let fileContent;
    let fileName;

    if (format === 'javascript') {
      fileContent = `const process = require("process");

if (require.main === module) {
    // Read file details from the first argument
    const fileDetails = JSON.parse(process.argv[2]);

    // Example processing logic
    const result = {
        status: "success",
        fileId: fileDetails.id,
        processedData: "Sample output based on the file."
    };

    // Output the result as JSON
    console.log(JSON.stringify(result));
}

`;
      fileName = 'basic_formate_javascript_code.js';
    } else if (format === 'python') {
      fileContent = `import sys
import json
import sqlite3

# Function to connect to the database and fetch data based on project_id
def fetch_table_data(project_id):
    """
    This function connects to the SQLite database and fetches data from a dynamically generated table 
    based on the projectId. The table name is assumed to be 'project_<projectId>'.
    """
    db = sqlite3.connect('./database.db')  # Path to your database
    cursor = db.cursor()

    try:
        # Dynamically generate the table name based on projectId
        table_name = f"project_{project_id}"

        # Execute the SQL query to fetch data from the dynamically generated table
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()

        if rows:
            return rows
        else:
            return {"error": "No data found for the given projectId"}
    except sqlite3.Error as e:
        return {"error": f"Database error: {e}"}
    finally:
        db.close()

# Function to calculate the mean of all columns
def calculate_column_means(data):
    """
    This function takes the fetched data and calculates the mean for each column.
    """
    if not data:
        return {}

    # Transpose the data to separate columns (each column is a list of values)
    transposed_data = list(zip(*data))
    
    # Calculate the mean for each column
    column_means = []
    for column in transposed_data:
        try:
            # Convert the column to float and calculate the mean
            column_mean = sum(map(float, column)) / len(column)
            column_means.append(column_mean)
        except ValueError:
            # Handle non-numeric values
            column_means.append(None)

    return column_means

# Main function that will handle the logic
def main():
    """
    The main function that fetches data and handles the necessary logic.
    """
    # Get the file details from command line arguments (already parsed as JSON)
    if len(sys.argv) < 2:
        print(json.dumps({"error": "File details not provided!"}))
        return

    file_details_json = sys.argv[1]
    file_details = json.loads(file_details_json)
    project_id = file_details.get("projectId", "")

    if project_id:
        # Fetch data from the database
        data = fetch_table_data(project_id)

        # Return the result as JSON
        if isinstance(data, list):  # If data is a list of rows
            # Calculate column means
            column_means = calculate_column_means(data)

            result = {
                "outputs": [
                    {"type": "text", "message": "Data fetched successfully"},
                    {"type": "mean", "means": column_means}
                ]
            }
            print(json.dumps(result))  # Return the result as JSON
        else:
            print(json.dumps(data))  # If data is an error message, return it
    else:
        print(json.dumps({"error": "projectId is missing or invalid"}))

# Entry point for the script
if __name__ == "__main__":
    main()
`;
      fileName = 'basic_formate_python_code.py';
    }

    const fileBlob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} sm={12}>
          <div className="text-center">
            <h1 className="mb-4">Upload File</h1>

            {/* Buttons to download format files */}
            <div className="mb-4">
              <Button
                variant="secondary"
                onClick={() => handleDownloadFormat('javascript')}
                className="me-2"
              >
                Download JavaScript Format
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleDownloadFormat('python')}
              >
                Download Python Format
              </Button>
            </div>

            {/* File upload form */}
            <Form>
              <Form.Group controlId="fileUpload" className="mb-4">
                <Form.Label>Choose a file to upload</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
              </Form.Group>
              <Button
                variant="primary"
                onClick={handleFileUpload}
                className="w-100"
              >
                Upload
              </Button>
            </Form>
            {message && (
              <Alert variant={messageType} className="mt-4">
                {message}
              </Alert>
            )}
          </div>
        </Col>
      </Row>

      {/* List of files for this project */}
      <div className="mt-5">
        <Row>
          <ListFiles projectId={projectId} />
        </Row>
      </div>
    </Container>
  );
}

export default FileUpload;
