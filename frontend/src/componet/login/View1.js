import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Create2 from './Create2';
import Create11 from './Create11';
import Table1 from './Table1';
import Chart1 from './Chart1';

export default function View1() {
  const { id } = useParams(); // Get the project ID from the URL
  const [showTable, setShowTable] = useState(false); // State to toggle table visibility

  // Example data, replace with data fetched from server based on ID
  const projectData = {
    id: id,
    name: `Project ${id}`,
    description: `This is a detailed description of the project with ID ${id}.`,
    createdAt: '2023-01-01',
    status: 'Active',
  };

  return (
    <Container className="mt-5">
      <h2>Project Details</h2>
      <p><strong>Name:</strong> {projectData.name}</p>
      <p><strong>Description:</strong> {projectData.description}</p>
      <p><strong>Created At:</strong> {projectData.createdAt}</p>
      <p><strong>Status:</strong> {projectData.status}</p>
      <hr />
      <Chart1/>
      <div className="d-grid gap-2">
      <Button variant="primary" size="lg">
      AI      </Button>
      <Button 
        variant={showTable ? "danger" : "success"} 
        onClick={() => setShowTable(!showTable)}
        className="mb-3" size ='lg'
      >
        {showTable ? "Hide Table" : "Show Table"}
      </Button>
    </div>
      
    

      {/* Conditionally render Table1 based on showTable state */}
      {showTable && <Table1 />}
      
      <Create11 />
      <Create2 />
    </Container>
  );
}
