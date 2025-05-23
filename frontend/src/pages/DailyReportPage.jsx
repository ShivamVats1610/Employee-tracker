import React, { useEffect, useState } from 'react';
import './DailyReportPage.css';
import axios from 'axios';

const BASE_URL = 'http://localhost:8082';

const DailyReportPage = () => {
  // Get either selected employee ID or current user's ID
  const selectedEmpId = localStorage.getItem('selectedEmpId');
  const currentEmpId = localStorage.getItem('id');
  const employeeId = selectedEmpId || currentEmpId;

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ date: '', task: '', status: 'completed' });

  const fetchReports = async () => {
    if (!employeeId) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/reports/my`, {
        params: { month, employeeId }
      });
      setReports(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [month, employeeId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const idToUse = localStorage.getItem('id'); // only allow submitting for logged-in user
      if (!idToUse) {
        alert('Employee ID not found in localStorage');
        return;
      }

      const res = await fetch(`${BASE_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: new Date(form.date),
          employeeId: idToUse
        })
      });

      const result = await res.json();
      if (res.ok) {
        alert('Report submitted!');
        setForm({ date: '', task: '', status: 'completed' });
        fetchReports(); // refetch to show updated data
      } else {
        alert(result.error || 'Submission failed');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Something went wrong');
    }
  };

  return (
    <>
      <img src="/assets/images/bgApplyleave.jpg" alt="background" className="background-leave" />
      <div className="daily-report-container">
        <div className="left-form" style={{ flex: '0.3' }}>
          <h2>Submit Daily Task</h2>
          <form onSubmit={handleSubmit}>
            <input
              className="daily-input"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            <textarea
              className="daily-input"
              name="task"
              value={form.task}
              onChange={handleChange}
              placeholder="Enter your task"
              required
              rows={6}
            />
            <select className="daily-input" name="status" value={form.status} onChange={handleChange}>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
            <button className="daily-button" type="submit">Submit</button>
          </form>
        </div>

        <div className="right-report" style={{ flex: '0.7' }}>
          <h2>Monthly Report</h2>
          <input
            className="daily-input"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <table className="daily-table">
            <thead>
              <tr>
                <th className="daily-th">Date</th>
                <th className="daily-th" style={{ width: '70%' }}>Task</th>
                <th className="daily-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index} className={report.status === 'completed' ? 'completed' : 'pending'}>
                  <td className="daily-td">{new Date(report.date).toLocaleDateString()}</td>
                  <td className="daily-td">{report.task}</td>
                  <td className="daily-td">{report.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DailyReportPage;
