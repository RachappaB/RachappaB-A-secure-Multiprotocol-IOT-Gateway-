import React, { Component } from 'react';
import { Button, Container, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class Create1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: true,
      restApiRead: '',
      restApiWrite: '',
    };
  }

  async componentDidMount() {
    const projectId = this.props.projectId; // Ensure you pass projectId as a prop or get it from context
    const urls = this.generateRestApiUrls(projectId);
    this.setState({
      restApiRead: urls.read,
      restApiWrite: urls.write,
    });
  }

  handleCloseModal = () => {
    this.setState({ showModal: false });
  }

  handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  }

  generateRestApiUrls = (projectId) => {
    const baseUrl = `http://localhost:3001/project`;
    return {
      read: `${baseUrl}/table/${projectId}`,
      write: `${baseUrl}/insert/${projectId}`
    };
  }

  render() {
    const { restApiRead, restApiWrite } = this.state;

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
              <h5>REST API Read</h5>
              <p>{restApiRead}</p>
              <Button variant="outline-primary" onClick={() => this.handleCopy(restApiRead)}>Copy</Button>
            </div>

            <div className="p-3 mb-3 border rounded">
              <h5>REST API Write</h5>
              <p>{restApiWrite}</p>
              <Button variant="outline-primary" onClick={() => this.handleCopy(restApiWrite)}>Copy</Button>
            </div>
            <Link className='nav-link' to='/create3'>
              <b>
                <Button variant="success" className="mt-4" onClick={this.handleNext}>Next</Button>
              </b>
            </Link>
          </div>
        )}
      </Container>
    );
  }
}
