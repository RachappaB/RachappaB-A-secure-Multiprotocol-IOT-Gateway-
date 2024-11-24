import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported
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

  // Handle form submission
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

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} sm={12}>
          <div className="text-center">
            <h1 className="mb-4">Upload File</h1>
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
