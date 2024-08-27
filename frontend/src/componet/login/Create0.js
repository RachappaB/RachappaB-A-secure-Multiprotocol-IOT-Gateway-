import React, { Component } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
export default class Create0 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectName: '',
      description: '',
      mode: 'Hard',
      numOfColumns: 0,
      columnNames: [],
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleModeChange = (e) => {
    const mode = e.target.value;
    this.setState({ mode: mode, numOfColumns: 0, columnNames: [] });
  };

  handleNumOfColumnsChange = (e) => {
    const numOfColumns = e.target.value;
    const columnNames = Array.from({ length: numOfColumns }, () => '');
    this.setState({ numOfColumns, columnNames });
  };

  handleColumnNameChange = (index, e) => {
    const newColumnNames = [...this.state.columnNames];
    newColumnNames[index] = e.target.value;
    this.setState({ columnNames: newColumnNames });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(this.state);
    // Handle form submission logic here, like sending data to a server
  };

  render() {
    return (
      <Container className="mt-5">
        <h2>Create New Project</h2>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group className="mb-3" controlId="formProjectName">
            <Form.Label>Project Name</Form.Label>
            <Form.Control
              type="text"
              name="projectName"
              value={this.state.projectName}
              onChange={this.handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={this.state.description}
              onChange={this.handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formMode">
            <Form.Label>Mode</Form.Label>
            <Form.Select name="mode" value={this.state.mode} onChange={this.handleModeChange}>
              <option value="Hard">Hard</option>
              <option value="Easy">Easy</option>
            </Form.Select>
          </Form.Group>

          {this.state.mode === 'Easy' && (
            <div>
              <Form.Group className="mb-3" controlId="formNumOfColumns">
                <Form.Label>Number of Columns</Form.Label>
                <Form.Control
                  type="number"
                  name="numOfColumns"
                  value={this.state.numOfColumns}
                  onChange={this.handleNumOfColumnsChange}
                  min="1"
                  required
                />
              </Form.Group>

              {Array.from({ length: this.state.numOfColumns }).map((_, index) => (
                <Form.Group key={index} className="mb-3" controlId={`formColumnName${index}`}>
                  <Form.Label>Column Name {index + 1}</Form.Label>
                  <Form.Control
                    type="text"
                    value={this.state.columnNames[index]}
                    onChange={(e) => this.handleColumnNameChange(index, e)}
                    required
                  />
                </Form.Group>
              ))}
            </div>
          )}
          <div>
            <Link className='nav-link' to='/create1'><b><Button variant="success" className="mt-4" onClick={this.handleNext}><Button variant="primary" type="submit">
            Create Project
          </Button></Button></b></Link>

            
          </div>
        
        </Form>
      </Container>
    );
  }
}
