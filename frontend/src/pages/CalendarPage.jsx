import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';
import './CalendarPage.css';

const COLORS = ['#4caf50', '#f44336'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BASE_URL = 'http://localhost:8082';

const CalendarPage = () => {
  const [summary, setSummary] = useState({
    currentMonthLeaves: 0,
    totalLeaves: 0,
    workingDaysThisMonth: 0,
  });
  const [attendanceList, setAttendanceList] = useState([]);

  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    const empid = localStorage.getItem('empid');
    if (empid) {
      setEmployeeId(empid);
    } else {
      console.warn('No empid found in localStorage.');
    }
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!employeeId) return;

      try {
        const res = await axios.get(`${BASE_URL}/api/attendance/summary`, {
          params: {
            month: selectedMonth + 1,
            empid: employeeId,
          },
        });

        if (res.data) {
          setSummary({
            currentMonthLeaves: res.data.currentMonthLeaves ?? 0,
            totalLeaves: res.data.totalLeaves ?? 0,
            workingDaysThisMonth: res.data.workingDaysThisMonth ?? 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch summary', err);
      }
    };

    const fetchAttendance = async () => {
      if (!employeeId) return;

      try {
        const res = await axios.get(`${BASE_URL}/api/attendance/monthly-log`, {
          params: {
            month: selectedMonth + 1,
            empid: employeeId,
          },
        });
        setAttendanceList(res.data || []);
      } catch (err) {
        console.error('Failed to fetch attendance list', err);
      }
    };

    fetchSummary();
    fetchAttendance();
  }, [selectedMonth, employeeId]);

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
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
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

          <div className="calendar-chart" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
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

          {/* Dark Table */}
          <div className="calendar-table">
            <h3 style={{ marginTop: '30px', color: '#fff' }}>📆 Daily Attendance - {MONTHS[selectedMonth]}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#333', color: '#fff' }}>
                  <th style={{ padding: '10px', border: '1px solid #555' }}>Date</th>
                  <th style={{ padding: '10px', border: '1px solid #555' }}>Status</th>
                </tr>
              </thead>
              <tbody>
  {(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const year = currentYear;

    let lastDay = 0;
    if (selectedMonth < currentMonth) {
      // Past month - show full month
      lastDay = new Date(year, selectedMonth + 1, 0).getDate();
    } else if (selectedMonth === currentMonth) {
      // Current month - only till today
      lastDay = today.getDate();
    } else {
      // Future month - show nothing
      return (
        <tr>
          <td colSpan="2" style={{ textAlign: 'center', padding: '10px', color: '#fff' }}>
            Future month – no data to display
          </td>
        </tr>
      );
    }

    const attendanceMap = new Map(
      attendanceList.map(item => [item.date, item.status])
    );

    const rows = [];

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, selectedMonth, day);
      const dateString = date.toISOString().split('T')[0];
      const status = attendanceMap.get(dateString) || 'Absent';

      rows.push(
        <tr
          key={dateString}
          style={{
            backgroundColor: status === 'Present' ? '#1e8e3e' : '#c62828',
            color: '#fff',
          }}
        >
          <td style={{ padding: '10px', border: '1px solid #555' }}>{dateString}</td>
          <td style={{ padding: '10px', border: '1px solid #555' }}>{status}</td>
        </tr>
      );
    }

    return rows;
  })()}
</tbody>


            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarPage;
