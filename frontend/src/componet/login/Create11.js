import React, { Component } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class Create11 extends Component {
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
        <div className="mt-5">
            <h1>URL</h1>
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

      
        </div>
      </Container>
    );
  }
}
