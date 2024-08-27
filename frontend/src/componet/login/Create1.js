import React, { Component } from 'react';
import { Button, Container, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class Create1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: true,
    };
  }

  handleCloseModal = () => {
    this.setState({ showModal: false });
  }

  handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  }

  handleNext = () => {
    // Handle the "Next" button logic here
    console.log("Next button clicked");
  }

  render() {
    const restApiData = "https://api.example.com/data";
    const quickData = "Quick data here...";
    const mqttData = "mqtt://broker.example.com";
    const coatData = "Coat data here...";

    return (
      <Container className="mt-5">
        {/* Modal for "Table Created" */}
        <Modal show={this.state.showModal} onHide={this.handleCloseModal} centered>
          <Modal.Body className="text-center">
            <h4>Table Created</h4>
            <Button variant="primary" onClick={this.handleCloseModal}>Close</Button>
          </Modal.Body>
        </Modal>

        {/* After closing the modal, show the following divs */}
        {!this.state.showModal && (
          <div className="mt-5">
            <h1>URLS</h1>
            <div className="p-3 mb-3 border rounded">
              <h5>REST API</h5>
              <p>{restApiData}</p>
              <Button variant="outline-primary" onClick={() => this.handleCopy(restApiData)}>Copy</Button>
            </div>

            <div className="p-3 mb-3 border rounded">
              <h5>Quick</h5>
              <p>{quickData}</p>
              <Button variant="outline-primary" onClick={() => this.handleCopy(quickData)}>Copy</Button>
            </div>

            <div className="p-3 mb-3 border rounded">
              <h5>MQTT</h5>
              <p>{mqttData}</p>
              <Button variant="outline-primary" onClick={() => this.handleCopy(mqttData)}>Copy</Button>
            </div>

            <div className="p-3 mb-3 border rounded">
              <h5>Coat</h5>
              <p>{coatData}</p>
              <Button variant="outline-primary" onClick={() => this.handleCopy(coatData)}>Copy</Button>
            </div>
            <Link className='nav-link' to='/create3'><b><Button variant="success" className="mt-4" onClick={this.handleNext}>Next</Button></b></Link>

            
          </div>
        )}
      </Container>
    );
  }
}
