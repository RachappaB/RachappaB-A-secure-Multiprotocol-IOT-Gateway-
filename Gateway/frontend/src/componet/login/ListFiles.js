import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';

function ListFiles({ projectId }) {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // For success or error messages

  // Fetch files for the project
  useEffect(() => {
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

    if (projectId) {
      fetchFiles();
    }
  }, [projectId]);

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
                    <strong>Stored File Name:</strong> {file.storedFileName}
                  </Card.Text>
                  <Card.Text>
                    <strong>File Address:</strong> {file.fileAddress}
                  </Card.Text>
                  <Card.Text>
                    <strong>File Details:</strong> {file.fileDetails}
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
