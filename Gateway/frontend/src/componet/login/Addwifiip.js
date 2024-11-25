import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Alert, Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // For making API requests
import { GlobalState } from './Global';

export default function Addwifiip() {
    const state = useContext(GlobalState);
    const [token] = state.token;
    const { id } = useParams(); // Get the project ID from the URL
    const [ip, setip] = useState(''); // State to hold the IP address input
    const [projectData, setProjectData] = useState(null); // State to hold project data
    const [iplist, setiplist] = useState([]); // State to hold the list of IP addresses
    const [error, setError] = useState(''); // State to hold error messages
    const [success, setSuccess] = useState(''); // State to hold success messages

    // Fetch project data and list of IP addresses
    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                // Fetch the project data from the backend
                const response = await axios.get(`/project/view/${id}`, {
                    headers: { Authorization: token },
                });
                setProjectData(response.data);

                // Fetch the list of IP addresses associated with this project
                const ipResponse = await axios.get(`/project/${id}/ip`, {
                    headers: { Authorization: token },
                });
                setiplist(ipResponse.data);
            } catch (error) {
                setError('Error fetching project data or IP list.');
                console.error('Error fetching project data or IP list:', error);
            }
        };

        fetchProjectData();
    }, [id, token]);

    const handleDownloadFile = async (mac) => {
        setError('');
        setSuccess('');
        try {
            const response = await axios.get(`/project/${id}/download/${mac}`, {
                headers: { Authorization: token },
                responseType: 'blob', // Expect a file response
            });

            // Create a downloadable file link for regular code
            const blob = new Blob([response.data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ESP32_${mac}.ino`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setSuccess('Code file downloaded successfully!');
        } catch (error) {
            setError('Failed to download the code file.');
            console.error('Error downloading the code file:', error);
        }
    };

    const handleDownloadmqttfile = async (mac) => {
        setError('');
        setSuccess('');
        try {
            const response = await axios.get(`/project/${id}/download/mqtt/${mac}`, {
                headers: { Authorization: token },
                responseType: 'blob', // Expect a file response
            });

            // Create a downloadable file link for MQTT code
            const blob = new Blob([response.data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ESP32_mqtt_${mac}.ino`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setSuccess('MQTT file downloaded successfully!');
        } catch (error) {
            setError('Failed to download the MQTT file.');
            console.error('Error downloading the MQTT file:', error);
        }
    };
    const handleDownloadmqttwaitfile = async (mac) => {
        setError('');
        setSuccess('');
        try {
            const response = await axios.get(`/project/${id}/download/mqttwait/${mac}`, {
                headers: { Authorization: token },
                responseType: 'blob', // Expect a file response
            });

            // Create a downloadable file link for MQTT code
            const blob = new Blob([response.data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ESP32_mqtt_wait_Send_and_recivie${mac}.ino`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setSuccess('MQTT file downloaded successfully!');
        } catch (error) {
            setError('Failed to download the MQTT file.');
            console.error('Error downloading the MQTT file:', error);
        }
    };

    const handleDownloadSecureFile = async (mac) => {
        setError('');
        setSuccess('');
        try {
            const response = await axios.get(`/project/${id}/download-secure/${mac}`, {
                headers: { Authorization: token },
                responseType: 'blob', // Expect a file response
            });

            const blob = new Blob([response.data], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ESP32_${mac}_secure.ino`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            setSuccess('Secure file downloaded successfully!');
        } catch (error) {
            setError('Failed to download the secure file.');
            console.error('Error downloading the secure file:', error);
        }
    };

    // Handle form submission to add a new IP address
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            // Send the IP address and project ID to the backend
            await axios.post(
                '/project/addip',
                { ip, projectId: id },
                { headers: { Authorization: token } }
            );
            setSuccess('IP address added successfully!');
            setip(''); // Clear the input field

            // Update the IP list after adding a new one
            const ipResponse = await axios.get(`/project/${id}/ip`, {
                headers: { Authorization: token },
            });
            setiplist(ipResponse.data);
        } catch (error) {
            setError('Failed to add IP address. Make sure it is unique and valid.');
            console.error('Error adding IP address:', error);
        }
    };

    // Handle deletion of an IP address
    const handleDeleteMac = async (mac) => {
        setError('');
        setSuccess('');
        try {
            await axios.delete(`/project/${id}/ip/${mac}`, {
                headers: { Authorization: token },
            });
            setSuccess('IP address deleted successfully!');
            // Remove the deleted IP address from the local state
            setiplist(iplist.filter((m) => m.ip !== mac));
        } catch (error) {
            setError('Failed to delete IP address.');
            console.error('Error deleting IP address:', error);
        }
    };

    if (!projectData) return <p>Loading...</p>;

    return (
        <Container className="mt-5">
            <h2>Add IP Address to Project: {projectData.name}</h2>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formip">
                    <Form.Label>IP Address</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter IP address"
                        value={ip}
                        onChange={(e) => setip(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="mt-3">
                    Add IP Address
                </Button>
            </Form>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            {success && <Alert variant="success" className="mt-3">{success}</Alert>}

            <h3 className="mt-5">IP Addresses in Project</h3>
            {iplist.length > 0 ? (
                <Table striped bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>IP Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {iplist.map((ip) => (
                            <tr key={ip.ip}>
                                <td>{ip.ip}</td>
                                <td>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleDownloadFile(ip.ip)}
                                    >
                                        Download Code
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="ms-2"
                                        onClick={() => handleDownloadSecureFile(ip.ip)}
                                    >
                                        Download with Security
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="ms-2"
                                        onClick={() => handleDownloadmqttfile(ip.ip)}
                                    >
                                        Download MQTT
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="ms-2"
                                        onClick={() => handleDownloadmqttwaitfile(ip.ip)}
                                    >
                                        Download MQTT send and recive
                                    </Button>
                                </td>
                                <td>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDeleteMac(ip.ip)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>No IP addresses added to this project yet.</p>
            )}
        </Container>
    );
}
