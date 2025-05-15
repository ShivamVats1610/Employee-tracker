// DailyReportPage.jsx
import React, { useState } from 'react';
import './DailyReportPage.css';

const DailyReportPage = () => {
  const [month, setMonth] = useState('2025-04');
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ date: '', task: '', status: 'completed' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setReports([...reports, form]);
    setForm({ date: '', task: '', status: 'completed' });
  };

  const filteredReports = reports.filter((r) => r.date.startsWith(month));

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
              {filteredReports.map((report, index) => (
                <tr key={index} className={report.status === 'completed' ? 'completed' : 'pending'}>
                  <td className="daily-td">{report.date}</td>
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
