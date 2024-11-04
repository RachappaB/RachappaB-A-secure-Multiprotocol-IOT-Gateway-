import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { GlobalState } from './Global';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

export default function Analysis() {
  const state = useContext(GlobalState);
  const [token] = state.token;
  const { projectId } = useParams(); // Get the project ID from the URL
  const [instructions, setInstructions] = useState([
    { instruction: '', result: null, error: null, loading: false },
  ]);
  const [chartData, setChartData] = useState({}); // State for chart data

  // Handle input change
  const handleChange = (index, e) => {
    const newInstructions = [...instructions];
    newInstructions[index].instruction = e.target.value;
    setInstructions(newInstructions);
  };

  // Handle running instruction
  const handleRun = async (index) => {
    const newInstructions = [...instructions];
    newInstructions[index].loading = true;
    newInstructions[index].error = null;
    newInstructions[index].result = null;
    setInstructions(newInstructions);

    try {
      const response = await axios.post(
        `/project/analyze/${projectId}`, // Ensure the projectId is in the URL
        { instruction: instructions[index].instruction },
        { headers: { Authorization: token } }
      );

      if (response.status === 200) {
        const queryResult = response.data.data; // Assuming the data is returned in 'data'
        newInstructions[index].result = queryResult;

        // Prepare chart data
        const labels = queryResult.map(item => item.date);
        const data = queryResult.map(item => item.total_a);
        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Total A',
              data: data,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });
      } else {
        newInstructions[index].error = response.data.message || 'Error processing the instruction';
      }
    } catch (err) {
      newInstructions[index].error = 'Error processing the instruction';
    } finally {
      newInstructions[index].loading = false;
      setInstructions(newInstructions);

      if (index === instructions.length - 1) {
        setInstructions([...instructions, { instruction: '', result: null, error: null, loading: false }]);
      }
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Analysis Page</h1>
      <p>Send SQL instructions to the backend for analysis.</p>

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
                      placeholder="Enter your SQL instruction"
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
                <pre>{JSON.stringify(instr.result, null, 2)}</pre>
              </Alert>
            )}
          </Card.Body>
        </Card>
      ))}

      {/* Render the bar graph if data is available */}
      {chartData.labels && chartData.labels.length > 0 && (
        <div className="mt-4">
          <h2>Bar Graph of Results</h2>
          <Bar data={chartData} />
        </div>
      )}
    </Container>
  );
}
