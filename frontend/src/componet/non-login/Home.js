import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
export default class Home extends Component {
  render() {
    return (
      <Container className="mt-5">
        <Row className="text-center bg-light p-5 rounded">
          <Col>
            <h1>Welcome to IoT Gateway</h1>
            <p>
              Our IoT gateway bridges the communication gap between diverse IoT devices,
              supporting multiple protocols like Zigbee, Z-Wave, Wi-Fi, and Bluetooth.
              Seamlessly manage and control your IoT ecosystem from a single platform.
            </p>
\            <Link to="/Login" className="dropdown-item"><Button variant="primary"   >Learn More</Button></Link>

          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <h3>Device Management</h3>
            <p>Efficiently manage all your connected devices in one place.</p>
          </Col>
          <Col>
            <h3>Data Analytics</h3>
            <p>Gather and analyze data from all your IoT devices.</p>
          </Col>
          <Col>
            <h3>Cloud Integration</h3>
            <p>Seamless integration with cloud platforms for extended capabilities.</p>
          </Col>
        </Row>
      </Container>
    );
  }
}
