import React, { Component } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
export default class Cloud0 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connectToCloud: false,
      backupFrequency: '',
    };
  }

  handleConnectChange = (e) => {
    this.setState({ connectToCloud: e.target.value === 'yes' });
  };

  handleFrequencyChange = (e) => {
    this.setState({ backupFrequency: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(this.state);
    // Handle form submission logic here, such as sending data to the server
  };

  render() {
    return (
      <Container className="mt-5">
        <h2>Cloud Backup Configuration</h2>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group className="mb-3" controlId="formConnectToCloud">
            <Form.Label>Do you want to connect to the cloud for backup?</Form.Label>
            <Form.Select onChange={this.handleConnectChange}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Form.Select>
          </Form.Group>

          {this.state.connectToCloud && (
            <div>
              <Form.Group className="mb-3" controlId="formBackupFrequency">
                <Form.Label>Backup Frequency</Form.Label>
                <Form.Select value={this.state.backupFrequency} onChange={this.handleFrequencyChange}>
                  <option value="">Select Frequency</option>
                  <option value="12 hours">Every 12 hours</option>
                  <option value="1 day">Once a day</option>
                  <option value="night">At night</option>
                  <option value="week">Every week</option>
                  <option value="month">Every month</option>
                </Form.Select>
              </Form.Group>

              <Button variant="primary" type="submit">
                Submit
              </Button>
            </div>
          )}
        </Form>
      </Container>
    );
  }
}
