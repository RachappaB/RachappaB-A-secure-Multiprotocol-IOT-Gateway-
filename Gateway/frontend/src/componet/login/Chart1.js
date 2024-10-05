import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the date adapter
import axios from 'axios';
import { useParams } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function Chart1() {
  const { id } = useParams(); // Get the project ID from the URL
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(`/project/table/${id}`);
        const rows = response.data.rows;

        if (rows.length === 0) {
          console.warn('No data found for the chart.');
          return;
        }

        // Extract column names
        const columnNames = Object.keys(rows[0]).filter(column => column !== 'timestamp');
        const timestamps = rows.map(row => row.timestamp);

        const datasets = columnNames.map((column, index) => ({
          label: column,
          data: rows.map(row => ({ x: row.timestamp, y: row[column] })),
          borderColor: `hsl(${index * 360 / columnNames.length}, 70%, 50%)`,
          backgroundColor: `hsl(${index * 360 / columnNames.length}, 70%, 90%)`,
          fill: true,
        }));

        setChartData({
          labels: timestamps,
          datasets: datasets
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();
  }, [id]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM d, yyyy', // Use valid date-fns format
        },
        title: {
          display: true,
          text: 'Timestamp',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  };

  return (
    <div className="mt-5">
      <h2>Data Line Chart</h2>
      <Line data={chartData} options={options} />
    </div>
  );
}
