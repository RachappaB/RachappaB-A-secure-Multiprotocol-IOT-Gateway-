import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';

function ListFiles({ projectId }) {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // For success or error messages
  const POLLING_INTERVAL = 1000; // Poll every 5 seconds

  // Fetch files for the project
  const fetchFiles = async () => {
    try {
      const response = await axios.get(`/project/files/${projectId}`);
      setFiles(response.data.files);
      setMessage('Files fetched successfully.');
      setMessageType('success');
    } catch (error) {
      setMessage('Error fetching files.');
      setMessageType('danger');
      console.error(error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchFiles(); // Fetch initially
      const interval = setInterval(fetchFiles, POLLING_INTERVAL); // Set polling interval

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [projectId]);

// Handle script run
// Handle script run and copy URL to clipboard
const runScript = async (fileId) => {
  try {
    // Create the URL based on the fileId
    const url = `http://localhost:3001/project/run-script-mqtt/${fileId}`;

    // Copy the URL to the clipboard
    await navigator.clipboard.writeText(url);

    setMessage('Script URL copied to clipboard successfully.');
    setMessageType('success');
  } catch (error) {
    setMessage('Error copying the URL to clipboard.');
    setMessageType('danger');
    console.error(error);
  }
};


  // Handle subscribing to MQTT
  const subscribeToMqtt = (fileId) => {
    // You can add custom logic to run the mosquitto_sub command or direct the user to run it manually
    console.log(`Subscribing to MQTT topic: project/results/${projectId}/${fileId}`);
    setMessage(`Subscribed to MQTT topic: project/results/${projectId}/${fileId}`);
    setMessageType('info');
  };

  // Handle downloading file
  const downloadFile = (fileUrl) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop(); // Extract file name from URL
    link.click();
  };

  return (
    <Container>
      {message && (
        <Alert variant={messageType} className="mb-4">
          {message}
        </Alert>
      )}

      <Row>
        {files.length > 0 ? (
          files.map((file, index) => (
            <Col md={6} sm={12} className="mb-4" key={index}>
              <Card>
                <Card.Body>
                  <Card.Title>{file.originalFileName}</Card.Title>
               
                  <Card.Text>
                    <strong>To run and publish data to MQTT:</strong> 
                    <Button 
                      variant="primary" 
                      onClick={() => runScript(file.id)} 
                      className="ml-2"
                    >
                      Run Script
                    </Button>
                  </Card.Text>

                  <Card.Text>
                    <strong>To subscribe to MQTT:</strong> 
                    <Button 
                      variant="secondary" 
                      onClick={() => subscribeToMqtt(file.id)} 
                      className="ml-2"
                    >
                      Subscribe to MQTT
                    </Button>
                  </Card.Text>

                  
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center">No files found for this project.</p>
        )}
      </Row>
    </Container>
  );
}

export default ListFiles;
