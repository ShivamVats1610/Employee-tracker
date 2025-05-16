import React, { useEffect, useState } from 'react';
import './ReportsPage.css';

const ReportsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [month, setMonth] = useState('2025-04');
  const [reports, setReports] = useState([]);

  // Fetch employees with role "employee"
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        const employeeOnly = data.filter(emp => emp.role === 'employee');
        setEmployees(employeeOnly);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch reports for selected employee and month
  useEffect(() => {
    const fetchReports = async () => {
      if (!selectedEmployeeId) return;

      try {
        const res = await fetch(`/api/reports?employeeId=${selectedEmployeeId}&month=${month}`);
        const data = await res.json();
        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, [selectedEmployeeId, month]);

  return (
    <div className="reports-page">
      <div className="employee-list">
        <h2>Employees</h2>
        <ul>
          {employees.map(emp => (
            <li
              key={emp.id}
              onClick={() => {
                setSelectedEmployeeId(emp.id);
                setSelectedEmployeeName(emp.name);
              }}
              className={selectedEmployeeId === emp.id ? 'active' : ''}
            >
              {emp.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="employee-report">
        {selectedEmployeeId ? (
          <>
            <h2>{selectedEmployeeName}'s Monthly Report</h2>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="daily-input"
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
                {reports.length > 0 ? (
                  reports.map((report, idx) => (
                    <tr key={idx} className={report.status}>
                      <td className="daily-td">{report.date}</td>
                      <td className="daily-td">{report.task}</td>
                      <td className="daily-td">{report.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="daily-td">No reports found.</td></tr>
                )}
              </tbody>
            </table>
          </>
        ) : (
          <h2>Select an employee to view reports</h2>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
