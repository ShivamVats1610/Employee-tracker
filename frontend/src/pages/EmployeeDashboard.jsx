import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';
import './EmployeeDashboard.css';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
// Attendance Pie Chart
const AttendancePieChart = ({ workingDays, leaves }) => {
  const pieData = [
    { name: 'Working Days', value: workingDays },
    { name: 'Leaves', value: leaves },
  ];
  const COLORS = ['#4caf50', '#f44336'];

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={90}
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
  );
};

// Daily Tasks Bar Chart
const TaskBarChart = ({ completed, pending }) => {
  const data = [
    { name: 'Completed', value: completed },
    { name: 'Pending', value: pending },
  ];
  const COLORS = ['#00C49F', '#FFBB28'];

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const empid = localStorage.getItem('empid');

  const [summary, setSummary] = useState({
    workingDaysThisMonth: 0,
    currentMonthLeaves: 0,
    totalLeaves: 0,
  });
  const [checkInStatus, setCheckInStatus] = useState(false);
  const [checkOutStatus, setCheckOutStatus] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [latestLeaveStatus, setLatestLeaveStatus] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);

  useEffect(() => {
    if (!empid) return;

    const today = new Date().toISOString().slice(0, 10);
    const currentMonthString = new Date().toISOString().slice(0, 7);
    const currentMonthNumber = new Date().getMonth() + 1;

    const fetchSummary = async () => {
      try {
        const res = await axios.get('${API_BASE_URL}/api/attendance/summary', {
          params: { employeeId: empid, month: currentMonthNumber },
        });
        setSummary(res.data);
      } catch (err) {
        console.error('Error fetching attendance summary:', err);
      }
    };

    const fetchStatus = async () => {
      try {
        const res = await axios.get('${API_BASE_URL}/api/attendance/status', {
          params: { employeeId: empid, date: today },
        });
        setCheckInStatus(res.data.checkedIn);
        setCheckOutStatus(res.data.checkedOut);
        setCheckInTime(res.data.checkInTime);
        setCheckOutTime(res.data.checkOutTime);
      } catch (err) {
        console.error('Error fetching check-in status:', err);
      }
    };

    const fetchTaskSummary = async () => {
      try {
        const res = await axios.get('${API_BASE_URL}/api/reports/summary', {
          params: { employeeId: empid, month: currentMonthString }
        });
        setCompletedTasks(res.data.completed || 0);
        setPendingTasks(res.data.pending || 0);
      } catch (err) {
        console.error('Error fetching task summary:', err);
      }
    };

    const fetchLeaveStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/leaves/apply/${empid}`);
        const latest = res.data.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        setLatestLeaveStatus(latest?.status || null);
      } catch (err) {
        console.error('Error fetching leave status:', err);
      }
    };

    fetchSummary();
    fetchStatus();
    fetchTaskSummary();
    fetchLeaveStatus();
  }, [empid]);

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  const formatTime = (timeStr) => {
    if (!timeStr) return '--';
    const date = new Date(`${new Date().toISOString().slice(0, 10)}T${timeStr}`);
    return isNaN(date) ? '--' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <img src="/assets/images/bgApplyleave.jpg" alt="background" className="background-emp-dashboard"/>
      <div className="dashboard-container">
        <h1>👋 Welcome to Dashboard</h1>

        <div className="dashboard-cards">
          <div className="card" onClick={() => navigate('/calendar')}>
            <h3>Attendance Summary ({currentMonthName})</h3>
            <p><strong>Working Days:</strong> {summary.workingDaysThisMonth}</p>
            <p><strong>Leaves:</strong> {summary.currentMonthLeaves}</p>
            <p><strong>Total Leaves:</strong> {summary.totalLeaves}</p>
            <AttendancePieChart
              workingDays={summary.workingDaysThisMonth}
              leaves={summary.currentMonthLeaves}
            />
            <button>View Details</button>
          </div>

          <div className="card" onClick={() => navigate('/check-in-out')}>
            <h3>Check In/Out Status</h3>
            <p><strong>Status:</strong> {checkInStatus ? '✅ Checked In' : '❌ Not Checked In'}</p>
            <p><strong>Time:</strong> {formatTime(checkInTime)}</p>
            <p><strong>Status:</strong> {checkOutStatus ? '✅ Checked Out' : '❌ Not Checked Out'}</p>
            <p><strong>Time:</strong> {formatTime(checkOutTime)}</p>
            <button>Go to Check In/Out</button>
          </div>

          <div className="card" onClick={() => navigate('/daily-report')}>
            <h3>Daily Tasks Summary</h3>
            <p><strong>Completed Tasks:</strong> {completedTasks}</p>
            <p><strong>Pending Tasks:</strong> {pendingTasks}</p>
            <TaskBarChart completed={completedTasks} pending={pendingTasks} />
            <button>View Tasks</button>
          </div>

          <div className="card" onClick={() => navigate('/apply-leave')}>
            <h3>Latest Leave Request</h3>
            {latestLeaveStatus
              ? <p>Status: <strong>{latestLeaveStatus}</strong></p>
              : <p>No recent leave request found</p>}
            <button>Apply or View Leave</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
