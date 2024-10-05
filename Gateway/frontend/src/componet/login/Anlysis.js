import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';

export default function Analysis() {
  const [instructions, setInstructions] = useState([{ instruction: '', result: null, error: null, loading: false }]);
  const { id } = useParams(); // Get the project ID from the URL
  const [projectId, setProjectId] = useState(id); // Example project ID

  const handleRun = async (index) => {
    const newInstructions = [...instructions];
    newInstructions[index].loading = true;
    newInstructions[index].error = null;
    newInstructions[index].result = null;
    setInstructions(newInstructions);

    try {
      const response = await fetch('/project/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instruction: instructions[index].instruction }),
      });

      const data = await response.json();

      if (response.ok) {
        newInstructions[index].result = data.result;
      } else {
        newInstructions[index].error = data.message || 'Error processing the instruction';
      }
    } catch (err) {
      newInstructions[index].error = 'Error processing the instruction';
    } finally {
      newInstructions[index].loading = false;
      setInstructions(newInstructions);

      // Add a new input section after the current one if it's the last in the array
      if (index === instructions.length - 1) {
        setInstructions([...instructions, { instruction: '', result: null, error: null, loading: false }]);
      }
    }
  };

  const handleChange = (index, e) => {
    const newInstructions = [...instructions];
    newInstructions[index].instruction = e.target.value;
    setInstructions(newInstructions);
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Analysis Page</h1><p>jupyter lab</p>

      {instructions.map((instr, index) => (
        <Card className="mb-3" key={index}>
          <Card.Body>
            <Form>
              <Row>
                <Col md={8}>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      value={instr.instruction}
                      onChange={(e) => handleChange(index, e)}
                      placeholder="Enter your instruction"
                      disabled={instr.loading}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Button
                    variant="primary"
                    onClick={() => handleRun(index)}
                    disabled={instr.loading || !instr.instruction}
                    block
                  >
                    {instr.loading ? 'Running...' : 'Run'}
                  </Button>
                </Col>
              </Row>
            </Form>

            {instr.error && (
              <Alert variant="danger" className="mt-3">
                <h5>Error:</h5>
                <pre>{instr.error}</pre>
              </Alert>
            )}

            {instr.result && (
              <Alert variant="success" className="mt-3">
                <h5>Result:</h5>
                {typeof instr.result === 'string' && instr.result.startsWith('data:image') ? (
                  <img src={instr.result} alt="Generated" className="img-fluid" />
                ) : (
                  <pre>{JSON.stringify(instr.result, null, 2)}</pre>
                )}
              </Alert>
            )}
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}
