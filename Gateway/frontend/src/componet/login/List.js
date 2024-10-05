// @flow strict
import React, { useState, useEffect, useContext } from 'react';
import { Container, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { GlobalState } from './Global';

export default function List() {
  const state = useContext(GlobalState);
  const [token] = state.token;
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/project/list', {
          headers: { Authorization: token },
        });
        setProjects(response.data.projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [token]);

  return (
    <Container className="mt-5">
      <h2>Your Projects</h2>
      <ListGroup>
        {projects.map((project) => (
          <ListGroup.Item key={project._id}>
            <Link to={`/view/${project._id}`}>{project.projectName}</Link>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
}
