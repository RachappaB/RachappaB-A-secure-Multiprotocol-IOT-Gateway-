import React, { Component } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';

export default class Create3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alertEnabled: false,
      condition: '',
      programmingLanguage: 'javascript',
      file: null,
      showAlertPopup: false,
    };
  }

  handleAlertToggle = () => {
    this.setState((prevState) => ({
      alertEnabled: !prevState.alertEnabled,
    }));
  };

  handleConditionChange = (e) => {
    this.setState({ condition: e.target.value });
  };

  handleProgrammingLanguageChange = (e) => {
    this.setState({ programmingLanguage: e.target.value });
  };

  handleFileChange = (e) => {
    this.setState({ file: e.target.files[0] });
  };

  handleSubmit = () => {
    if (this.state.file) {
      const formData = new FormData();
      formData.append('file', this.state.file);
      formData.append('programmingLanguage', this.state.programmingLanguage);
      formData.append('condition', this.state.condition);

      // Example: Use axios to send the file to the server (implement your own endpoint)
      // axios.post('/upload-endpoint', formData)
      //   .then(response => console.log(response))
      //   .catch(error => console.error(error));

      this.setState({ showAlertPopup: true });
    }
  };

  render() {
    return (
      <Container className="mt-5">
        <h2>Alert Settings</h2>

        <Form.Check 
          type="switch"
          id="alert-switch"
          label="Enable Alerts"
          checked={this.state.alertEnabled}
          onChange={this.handleAlertToggle}
          className="mb-3"
        />

        {this.state.alertEnabled && (
          <div>
            <Form.Group controlId="condition" className="mb-3">
              <Form.Label>Select Condition</Form.Label>
              <Form.Control 
                as="select"
                value={this.state.condition}
                onChange={this.handleConditionChange}
              >
                <option value="">Choose...</option>
                <option value="high">High</option>
                <option value="low">Low</option>
                <option value="custom">Custom Condition</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="programmingLanguage" className="mb-3">
              <Form.Label>Programming Language</Form.Label>
              <Form.Control 
                as="select"
                value={this.state.programmingLanguage}
                onChange={this.handleProgrammingLanguageChange}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="file" className="mb-3">
              <Form.Label>Upload Code File</Form.Label>
              <Form.Control 
                type="file"
                onChange={this.handleFileChange}
              />
            </Form.Group>

            <Button variant="primary" onClick={this.handleSubmit}>
              Submit
            </Button>
          </div>
        )}

        {this.state.showAlertPopup && (
          <Alert variant="success" className="mt-4">
            Alert setup complete! Your file has been sent to the server.
          </Alert>
        )}
      </Container>
    );
  }
}
