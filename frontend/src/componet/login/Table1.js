import React, { useState, useEffect } from 'react';
import { Table, Container } from 'react-bootstrap';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

export default function Table1() {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const { id } = useParams(); // Get the project ID from the URL

    const [projectId, setProjectId] = useState(id); // Example project ID

    useEffect(() => {
        const fetchTableData = async () => {
            try {
                // Fetch table data
                const response = await axios.get(`/project/table/${projectId}`);
                console.log('Fetched table data:', response.data); // Log fetched data

                if (response.data && response.data.rows) {
                    setData(response.data.rows);
                }

                // Fetch column names
                const columnResponse = await axios.get(`/project/columns/${projectId}`);
                console.log('Fetched column names:', columnResponse.data); // Log column names

                if (columnResponse.data && columnResponse.data.columns) {
                    setColumns(columnResponse.data.columns);
                }
            } catch (error) {
                console.error('Error fetching table data:', error);
            }
        };

        fetchTableData();
    }, [projectId]);

    return (
        <Container className="mt-4">
            <h4>Project Data Table</h4>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} style={{ border: '1px solid #ddd' }}>{column}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index}>
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} style={{ border: '1px solid #ddd' }}>{row[column]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}
