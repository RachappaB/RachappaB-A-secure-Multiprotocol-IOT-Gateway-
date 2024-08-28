import React, { useState, useEffect, useContext } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // For making API requests
import Table1 from './Table1';
import { GlobalState } from './Global';
import Chart1 from './Chart1'
import Create1 from './Create1';
import Create2 from './Create2';
import Create3 from './Create3';
import Create11 from './Create11';


export default function View1() {
  const state = useContext(GlobalState);
  const [token] = state.token;
  const { id } = useParams(); // Get the project ID from the URL
  const [projectData, setProjectData] = useState(null); // State to hold project data
  const [showTable, setShowTable] = useState(false); // State to toggle table visibility

  useEffect(() => {
    // Fetch project data from the server
    const fetchProjectData = async () => {
      try {
        const response = await axios.get(`/project/view/${id}`, {
          headers: { Authorization: token },
        });
        setProjectData(response.data);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, [id]);

  if (!projectData) return <p>Loading...</p>;

  return (
    <Container className="mt-5">
      <h2>Project Details</h2>
      <p><strong>Name:</strong> {projectData.projectName}</p>
      <p><strong>Description:</strong> {projectData.description}</p>
      <p><strong>Created At:</strong> {new Date(projectData.createdAt).toLocaleString()}</p>
      <p><strong>Status:</strong> Active</p> {/* Assuming status is always active */}
      <hr />
      <Chart1/>

      <div className="d-grid gap-2">
        <Button variant="primary" size="lg">AI</Button>
        <Button 
          variant={showTable ? "danger" : "success"} 
          onClick={() => setShowTable(!showTable)}
          className="mb-3" 
          size='lg'
        >
          {showTable ? "Hide Table" : "Show Table"}
        </Button>
      </div>
      {/* Conditionally render Table1 based on showTable state */}
      {showTable && <Table1/>}
      <Create11/>
      <Create2/>
      <Create3/>
    </Container>
  );
}
