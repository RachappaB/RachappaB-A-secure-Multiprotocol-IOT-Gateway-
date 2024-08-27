import React, { Component } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default class Services extends Component {
  render() {
    const services = [
      {
        title: 'Security',
        description: 'Implement robust security measures to protect data and ensure the integrity of communications across different protocols.'
      },
      {
        title: 'Scalability',
        description: 'Design the gateway to handle increasing loads, ensuring that it can scale horizontally and vertically as the number of connected devices grows.'
      },
      {
        title: 'Performance',
        description: 'Optimize the gateway for low-latency communication and efficient data processing, even with a large number of connected devices.'
      },
      {
        title: 'Reliability and Availability',
        description: 'Ensure the gateway operates continuously without downtime, with failover mechanisms in place for high availability.'
      },
      {
        title: 'Interoperability',
        description: 'Support multiple communication protocols, ensuring seamless interaction between heterogeneous IoT devices and cloud platforms.'
      },
      {
        title: 'Manageability',
        description: 'Provide easy-to-use management tools and interfaces for monitoring and controlling connected devices and the gateway itself.'
      },
      {
        title: 'Maintainability',
        description: 'Design the system with modularity and clear documentation, making it easy to maintain, update, and extend the gateway functionality.'
      },
    ];

    return (
      <Container className="mt-5">
        <h2 className="text-center mb-4">Our Key Services</h2>
        <Row>
          {services.map((service, index) => (
            <Col md={4} className="mb-4" key={index}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{service.title}</Card.Title>
                  <Card.Text>{service.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }
}
