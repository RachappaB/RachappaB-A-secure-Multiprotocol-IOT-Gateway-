import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { GlobalState } from './Global';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';

export default function CSVFILE() {
  const state = useContext(GlobalState);
  const [token] = state.token;
  const { projectId } = useParams(); // Get the project ID from the URL
  const [error, setError] = useState(''); // Error state for error messages
  const [loading, setLoading] = useState(false); // Loading state for the button

  const handleDownload = async () => {
    setLoading(true);
    setError('');
    try {
      // Make a request to the backend to generate and download the CSV file
      const response = await axios.get(`/project/download/${projectId}`, {
        responseType: 'blob',
        headers: { Authorization: token },
      });

      // Create a URL for the file and initiate download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project_${projectId}.csv`); // Set the file name for download as CSV
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link); // Clean up
    } catch (error) {
      console.error('Error downloading the CSV file:', error);
      setError('Failed to download the CSV file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="text-center mt-5">
      <h3>Download Project CSV File</h3>
      <p>Click the button below to download the CSV file for project: {projectId}</p>
      <Button
        variant="primary"
        onClick={handleDownload}
        disabled={loading}
        className="my-3"
      >
        {loading ? (
          <>
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
            &nbsp;Generating CSV...
          </>
        ) : (
          'Download CSV File'
        )}
      </Button>
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
    </Container>
  );
}
