import React, { useState, useEffect, useContext } from 'react';
import { Container, Button, Alert, Table, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { GlobalState } from './Global';

export default function Push_to_Cloud() {
  const state = useContext(GlobalState);
  const [token] = state.token;
  const { projectId } = useParams(); // Get the project ID from the URL
  const [projectData, setProjectData] = useState(null); // Hold project info
  const [loading, setLoading] = useState(false); // Loading state for button
  const [success, setSuccess] = useState(''); // Hold success messages
  const [error, setError] = useState(''); // Hold error messages
  const [lastPushed, setLastPushed] = useState(null); // Store last pushed timestamp

  // Fetch project data on component mount
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await axios.get(`/project/view/${projectId}`, {
          headers: { Authorization: token },
        });
        setProjectData(response.data);
        setLastPushed(response.data.lastPushed || null); // Save last pushed timestamp if available
      } catch (error) {
        setError('Error fetching project data.');
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, [projectId, token]);

  // Function to trigger data push to the cloud
  const handlePushToCloud = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.get(`/project/pushdata/${projectId}`, {
        headers: { Authorization: token },
      });

      setSuccess('Data pushed to the cloud successfully!');
      setLastPushed(new Date().toLocaleString()); // Update with current timestamp
    } catch (error) {
      setError('Failed to push data to the cloud.');
      console.error('Error pushing data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!projectData) return <p>Loading project data...</p>;

  return (
    <Container className="mt-5">
      <h2>Push Data to Cloud - Project: {projectData.projectName}</h2>

      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      {success && <Alert variant="success" className="mt-3">{success}</Alert>}

      <Button
        variant="primary"
        onClick={handlePushToCloud}
        className="mt-3"
        disabled={loading}
      >
        {loading ? <Spinner animation="border" size="sm" /> : 'Push Data to Cloud'}
      </Button>

      <h3 className="mt-5">Project Details</h3>
      <Table striped bordered hover className="mt-3">
        <tbody>
          <tr>
            <th>Project Name</th>
            <td>{projectData.projectName}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td>{projectData.description || 'N/A'}</td>
          </tr>
          <tr>
            <th>Mode</th>
            <td>{projectData.mode}</td>
          </tr>
          <tr>
            <th>Number of Columns</th>
            <td>{projectData.numOfColumns}</td>
          </tr>
          <tr>
            <th>Column Names</th>
            <td>{projectData.columnNames.join(', ') || 'N/A'}</td>
          </tr>
          <tr>
            <th>Created At</th>
            <td>{new Date(projectData.createdAt).toLocaleString()}</td>
          </tr>
          <tr>
            <th>Last Pushed to Cloud</th>
            <td>{lastPushed ? lastPushed : 'Not pushed yet'}</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}
