import React, { Component } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default class About extends Component {
  render() {
    return (
      <Container className="mt-5">
        <h2 className="text-center mb-4">About Our Project</h2>
        <Row>
          <Col md={12}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Project Title</Card.Title>
                <Card.Text>A Secure Multiprotocol IoT Gateway</Card.Text>
              </Card.Body>
            </Card>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Project ID</Card.Title>
                <Card.Text>PW24_CBR_01</Card.Text>
              </Card.Body>
            </Card>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Project Guide</Card.Title>
                <Card.Text>Prof. Charanraj B R</Card.Text>
              </Card.Body>
            </Card>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Project Team</Card.Title>
                <Card.Text>
                  <ul>
                    <li>PES1UG21CS063 – Akshatha P</li>
                    <li>PES1UG22CS818 – Faisal</li>
                    <li>PES1UG22CS829 – Praveen</li>
                    <li>PES1UG19CS359 – Rachappa</li>
                  </ul>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}
