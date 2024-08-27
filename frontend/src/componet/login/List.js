import React, { Component } from 'react';
import { Container, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class List extends Component {
  constructor(props) {
    super(props);
    // Example project data, replace with actual data
    this.state = {
      projects: [
        { id: 1, name: 'Project Alpha' },
        { id: 2, name: 'Project Beta' },
        { id: 3, name: 'Project Gamma' },
      ],
    };
  }

  render() {
    return (
      <Container className="mt-5">
        <h2>Your Projects</h2>
        <ListGroup>
          {this.state.projects.map((project) => (
            <ListGroup.Item key={project.id}>
              <Link to={`/view/${project.id}`}>{project.name}</Link>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Container>
    );
  }
}
