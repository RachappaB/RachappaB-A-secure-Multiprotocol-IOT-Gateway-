// @flow strict
import React, { Component } from 'react'
import { useState, useContext } from 'react';
import axios from 'axios';
import { GlobalState } from './Global';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Create0() {
  const state = useContext(GlobalState);
  const [token] = state.token;
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState('Hard');
  const [numOfColumns, setNumOfColumns] = useState(0);
  const [columnNames, setColumnNames] = useState([]);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'projectName') setProjectName(value);
    if (name === 'description') setDescription(value);
  };

  const handleModeChange = (e) => {
    setMode(e.target.value);
    setNumOfColumns(0);
    setColumnNames([]);
  };

  const handleNumOfColumnsChange = (e) => {
    const num = parseInt(e.target.value, 10);
    setNumOfColumns(num);
    setColumnNames(Array.from({ length: num }, () => ''));
  };

  const handleColumnNameChange = (index, e) => {
    const newColumnNames = [...columnNames];
    newColumnNames[index] = e.target.value;
    setColumnNames(newColumnNames);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const projectData = {
      projectName,
      description,
      mode,
      numOfColumns,
      columns: columnNames,
    };

    try {
      const response = await axios.post('/project/create', projectData,{   headers: {Authorization: token}});
      if (response.status === 200) {
        console.log('Project created successfully:', response.data);
        navigate('/list');  // Redirect to the list page or another route
      } else {
        console.error('Failed to create project:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Create New Project</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formProjectName">
          <Form.Label>Project Name</Form.Label>
          <Form.Control
            type="text"
            name="projectName"
            value={projectName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label>Description (Optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="description"
            value={description}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formMode">
          <Form.Label>Mode</Form.Label>
          <Form.Select name="mode" value={mode} onChange={handleModeChange}>
            <option value="Hard">Hard</option>
            <option value="Easy">Easy</option>
          </Form.Select>
        </Form.Group>

        {mode === 'Easy' && (
          <>
            <Form.Group className="mb-3" controlId="formNumOfColumns">
              <Form.Label>Number of Columns</Form.Label>
              <Form.Control
                type="number"
                name="numOfColumns"
                value={numOfColumns}
                onChange={handleNumOfColumnsChange}
                min="1"
                required
              />
            </Form.Group>

            {Array.from({ length: numOfColumns }).map((_, index) => (
              <Form.Group key={index} className="mb-3" controlId={`formColumnName${index}`}>
                <Form.Label>Column Name {index + 1}</Form.Label>
                <Form.Control
                  type="text"
                  value={columnNames[index]}
                  onChange={(e) => handleColumnNameChange(index, e)}
                  required
                />
              </Form.Group>
            ))}
          </>
        )}

        <Button variant="primary" type="submit">
          Create Project
        </Button>
      </Form>
    </Container>
  );
}
