
import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Alert, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // For making API requests
import { GlobalState } from './Global';

export default function Addwifiip() {
    const state = useContext(GlobalState);
  const [token] = state.token;
  const { id } = useParams(); // Get the project ID from the URL
  const [ip, setip] = useState(''); // State to hold the MAC address input
  const [projectData, setProjectData] = useState(null); // State to hold project data
  const [iplist, setiplist] = useState([]); // State to hold the list of MAC addresses
  const [error, setError] = useState(''); // State to hold error messages
  const [success, setSuccess] = useState(''); // State to hold success messages

  // Fetch project data and list of MAC addresses
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch the project data from the backend
        const response = await axios.get(`/project/view/${id}`, {
          headers: { Authorization: token },
        });
        setProjectData(response.data);

        // Fetch the list of MAC addresses associated with this project
        const macResponse = await axios.get(`/project/${id}/ip`, {
          headers: { Authorization: token },
        });
        setiplist(macResponse.data);
      } catch (error) {
        setError('Error fetching project data or MAC list.');
        console.error('Error fetching project data or MAC list:', error);
      }
    };

    fetchProjectData();
  }, [id, token]);

  // Handle form submission to add a new MAC address
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Send the MAC address and project ID to the backend
      await axios.post(
        '/project/addip',
        { ip, projectId: id },
        { headers: { Authorization: token } }
      );
      setSuccess('MAC address added successfully!');
      setip(''); // Clear the input field

      // Update the MAC list after adding a new one
      const macResponse = await axios.get(`/project/${id}/ip`, {
        headers: { Authorization: token },
      });
      setiplist(macResponse.data);
    } catch (error) {
      setError('Failed to add MAC address. Make sure it is unique and valid.');
      console.error('Error adding MAC address:', error);
    }
  };

  // Handle deletion of a MAC address
  const handleDeleteMac = async (mac) => {
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/project/${id}/ip/${mac}`, {
        headers: { Authorization: token },
      });
      setSuccess('MAC address deleted successfully!');
      // Remove the deleted MAC address from the local state
      setiplist(iplist.filter((m) => m.ip !== mac));
    } catch (error) {
      setError('Failed to delete MAC address.');
      console.error('Error deleting MAC address:', error);
    }
  };

  if (!projectData) return <p>Loading...</p>;

  return (
    <Container className="mt-5">
      <h2>Add BLE MAC Address to Project: {projectData.name}</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formip">
          <Form.Label>MAC Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter MAC address"
            value={ip}
            onChange={(e) => setip(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          Add MAC Address
        </Button>
      </Form>
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      {success && <Alert variant="success" className="mt-3">{success}</Alert>}

      <h3 className="mt-5">MAC Addresses in Project</h3>
      {iplist.length > 0 ? (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>MAC Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {iplist.map((mac) => (
              <tr key={mac.ip}>
                <td>{mac.ip}</td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteMac(mac.ip)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No MAC addresses added to this project yet.</p>
      )}
    </Container>
  );
}
