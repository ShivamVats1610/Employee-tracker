import React, { useEffect, useState } from 'react';
import './ReportsPage.css';

const BASE_URL = 'http://localhost:8082';

const ReportsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [reports, setReports] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [errorEmployees, setErrorEmployees] = useState(null);
  const [errorReports, setErrorReports] = useState(null);

  // Load employees once on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      setErrorEmployees(null);
      try {
        const res = await fetch(`${BASE_URL}/api/employees`);
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data = await res.json();
        const filtered = data.filter(emp => emp.role?.toLowerCase() === 'employee');
        setEmployees(filtered);

        // Load selectedEmpName from localStorage
        const savedEmpName = localStorage.getItem('selectedEmpName');
        if (savedEmpName) {
          const matchedEmp = filtered.find(emp => emp.username === savedEmpName);
          if (matchedEmp) {
            setSelectedEmployee(matchedEmp);
          } else {
            setSelectedEmployee(null);
          }
        }
      } catch (err) {
        console.error('Employee fetch error:', err);
        setErrorEmployees('Failed to load employees.');
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  // Clear previous reports when selected employee changes
  useEffect(() => {
    setReports([]);
    setErrorReports(null);
  }, [selectedEmployee]);

  // Fetch reports when selectedEmployee or month changes
  useEffect(() => {
    const fetchReports = async () => {
      if (!selectedEmployee?._id) {
        setReports([]);
        return;
      }

      setLoadingReports(true);
      setErrorReports(null);

      try {
        const url = `${BASE_URL}/api/reports/my?employeeId=${selectedEmployee._id}&month=${month}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to fetch reports');

        setReports(data);
      } catch (err) {
        console.error('Report fetch error:', err);
        setErrorReports('Failed to load reports.');
        setReports([]);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, [selectedEmployee, month]);

  // Handle employee selection: update localStorage and state
  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    localStorage.setItem('selectedEmpId', emp._id);
    localStorage.setItem('selectedEmpName', emp.username); // Store username
  };

  return (
    <div className="reports-page" style={{ display: 'flex', gap: '1rem' }}>
      {/* Left: Employee List */}
      <div className="employee-list" style={{ flex: 1 }}>
        <h2>Employees</h2>
        {loadingEmployees ? (
          <p>Loading employees...</p>
        ) : errorEmployees ? (
          <p className="error">{errorEmployees}</p>
        ) : employees.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <ul>
            {employees.map(emp => (
              <li
                key={emp._id}
                onClick={() => handleSelectEmployee(emp)}
                className={selectedEmployee?._id === emp._id ? 'active' : ''}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelectEmployee(emp);
                }}
                style={{ cursor: 'pointer', padding: '0.5rem' }}
              >
                {emp.name || emp.username || 'Unnamed'}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right: Report View */}
      <div className="employee-report" style={{ flex: 2 }}>
        {selectedEmployee ? (
          <>
            <h2>{selectedEmployee.name || selectedEmployee.username}'s Monthly Report</h2>

            <input
              type="month"
              className="daily-input"
              value={month}
              onChange={e => setMonth(e.target.value)}
              style={{ marginBottom: '1rem' }}
            />

            {loadingReports ? (
              <p>Loading reports...</p>
            ) : errorReports ? (
              <p className="error">{errorReports}</p>
            ) : reports.length === 0 ? (
              <p>No reports found for this month.</p>
            ) : (
              <table className="daily-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Task</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, idx) => (
                    <tr key={idx} className={report.status === 'completed' ? 'completed' : 'pending'}>
                      <td>{new Date(report.date).toLocaleDateString()}</td>
                      <td>{report.task}</td>
                      <td>{report.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <p>Please select an employee to view reports.</p>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
