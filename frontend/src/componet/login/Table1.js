import React from 'react';
import { Table } from 'react-bootstrap';

const sampleData = [
  { column1: 'Data 1', column2: 'Data 2' },
  { column1: 'Data 3', column2: 'Data 4' },
  // Add more rows as needed
];

export default function Table1() {
  return (
    <div className="mt-4">
      <h4>Project Data Table</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
            {/* Add more column headers as needed */}
          </tr>
        </thead>
        <tbody>
          {sampleData.map((row, index) => (
            <tr key={index}>
              <td>{row.column1}</td>
              <td>{row.column2}</td>
              {/* Add more data cells as needed */}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
