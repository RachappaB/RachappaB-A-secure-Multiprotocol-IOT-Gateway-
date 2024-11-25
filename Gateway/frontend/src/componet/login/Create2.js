import React, { Component } from 'react';
import { Container, Button, Form } from 'react-bootstrap';

export default class Create2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      restApiAddresses: [
        { address: '192.168.1.1', allowed: true },
        { address: '192.168.1.2', allowed: false },
      ],
      quickAddresses: [
        { address: 'AA:BB:CC:DD:EE:01', allowed: true },
        { address: 'AA:BB:CC:DD:EE:02', allowed: false },
      ],
      mqttAddresses: [
        { address: '192.168.1.3', allowed: true },
        { address: '192.168.1.4', allowed: false },
      ],
      coatAddresses: [
        { address: 'AA:BB:CC:DD:EE:03', allowed: true },
        { address: 'AA:BB:CC:DD:EE:04', allowed: false },
      ],
    };
  }

  handleToggleAllow = (category, index) => {
    const categoryState = this.state[category];
    const updatedCategoryState = categoryState.map((item, i) =>
      i === index ? { ...item, allowed: !item.allowed } : item
    );
    this.setState({ [category]: updatedCategoryState });
  };

  renderAddressList = (addresses, category) => {
    return addresses.map((item, index) => (
      <div key={index} className="d-flex justify-content-between align-items-center mb-2">
        <span>{item.address}</span>
        <Button
          variant={item.allowed ? 'success' : 'danger'}
          onClick={() => this.handleToggleAllow(category, index)}
        >
          {item.allowed ? 'Allowed' : 'Blocked'}
        </Button>
      </div>
    ));
  };

  render() {
    const { restApiAddresses, quickAddresses, mqttAddresses, coatAddresses } = this.state;

    return (
      <Container className="mt-5">

     
      </Container>
    );
  }
}
