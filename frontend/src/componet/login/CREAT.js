import React, { Component } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

export default class CREAT extends Component {
  render() {
    const gatewayTypes = [
      {
        type: 'A',
        title: 'Non-Real-Time Data Analysis',
        description: `The analyzed data is used to enhance that object's performance or the performance
        of other objects in the system in a non-real-time manner.`,
        image: 'https://via.placeholder.com/300x200?text=Art+Gallery+Scenario', // Replace with actual image URL
        bgColor: 'info'
      },
      {
        type: 'B',
        title: 'Real-Time Data Analysis for Object Performance',
        description: `The collected data from a physical object is analyzed in real time, and the results are sent
        to the object to increase its performance or help the object make a better decision.`,
        image: 'https://via.placeholder.com/300x200?text=Blood+Glucose+Monitoring', // Replace with actual image URL
        bgColor: 'warning'
      },
      {
        type: 'C',
        title: 'Real-Time Data Analysis for Networked Objects',
        description: `The sensor data is analyzed in real time, and the results are sent to one or more objects in the network 
        to give them appropriate commands regarding their operations or help those objects make better decisions to increase their performance.`,
        image: 'https://via.placeholder.com/300x200?text=Smart+Wearable+Device', // Replace with actual image URL
        bgColor: 'success'
      },
    ];

    return (
      <Container className="mt-5">
        <h2 className="text-center mb-4">Choose Your IoT Gateway Type</h2>
        <Row>
          {gatewayTypes.map((gateway, index) => (
            <Col md={4} className="mb-4" key={index}>
              <Card className={`h-100 text-white bg-${gateway.bgColor}`}>
                <Card.Img variant="top" src={gateway.image} alt={`Image for ${gateway.type}`} />
                <Card.Body>
                  <Card.Title>Type {gateway.type}: {gateway.title}</Card.Title>
                  <Card.Text>{gateway.description}</Card.Text>
                  <Button variant="light" size="lg" block> {/* Block makes the button fluid */}
                    Select Type {gateway.type}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }
}
