import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import './CalendarPage.css';

const COLORS = ['#4caf50', '#f44336']; // Green for working, red for leave
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarPage = () => {
  const [summary, setSummary] = useState({
    currentMonthLeaves: 0,
    totalLeaves: 0,
    workingDaysThisMonth: 0,
  });

  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`/api/attendance-summary?month=${selectedMonth + 1}`); // month=1 for Jan
        setSummary(res.data);
      } catch (err) {
        console.error('Failed to fetch summary', err);
      }
    };

    fetchSummary();
  }, [selectedMonth]);

  const pieData = [
    { name: 'Working Days', value: summary.workingDaysThisMonth },
    { name: 'Leaves', value: summary.currentMonthLeaves },
  ];

  return (
    <>
  <img src="/assets/images/bgApplyleave.jpg" alt="background" className="background-calendar" />
  <div className="calendar-page">
    <div className="calendar-container">
      <div className="calendar-summary">
        <h2>📅 Attendance Summary</h2>

        <select
          className="month-dropdown"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
        >
          {MONTHS.map((month, idx) => (
            <option key={month} value={idx}>
              {month}
            </option>
          ))}
        </select>

        <p><strong>Leaves ({MONTHS[selectedMonth]}):</strong> {summary.currentMonthLeaves}</p>
        <p><strong>Total Leaves:</strong> {summary.totalLeaves}</p>
        <p><strong>Working Days ({MONTHS[selectedMonth]}):</strong> {summary.workingDaysThisMonth}</p>
      </div>

      <div className="calendar-chart">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={120}
              dataKey="value"
              paddingAngle={5}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="top" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
</>

  );
};

export default CalendarPage;
