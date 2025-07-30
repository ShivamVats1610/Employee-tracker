import React, { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import './Employees.css';

// const BASE_URL = 'http://localhost:8082';
import API_BASE_URL from './config';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Employee',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (showForm) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showForm]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees`);
      const data = await res.json();
      const employeeOnly = data.filter(emp => emp.role === 'Employee');
      const month = new Date().getMonth() + 1;

      const employeeWithStats = await Promise.all(
        employeeOnly.map(async (emp) => {
          try {
            const summaryRes = await fetch(
              `${API_BASE_URL}/api/attendance/summary?empid=${emp.username}&month=${month}`
            );
            const summaryData = await summaryRes.json();
            return {
              ...emp,
              workingDays: summaryData.workingDaysThisMonth || 0,
              leaveDays: summaryData.currentMonthLeaves || 0,
            };
          } catch {
            return {
              ...emp,
              workingDays: 0,
              leaveDays: 0,
            };
          }
        })
      );

      setEmployees(employeeWithStats);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (username) => {
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${username}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEmployees(employees.filter(emp => emp.username !== username));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword, role } = formData;

    if (!username || !password || !confirmPassword) {
      alert('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to register employee');
      } else {
        alert('Employee added successfully');
        setShowForm(false);
        setFormData({ username: '', password: '', confirmPassword: '', role: 'Employee' });
        fetchEmployees();
      }
    } catch (err) {
      console.error('Register error:', err);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="employees-container">
      <div className="header-employees">
        <h2>Manage Employees</h2>
        <div className="actions">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="add-btn" onClick={() => setShowForm(true)}>Add Employee</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
          <ClipLoader color="#4fa94d" size={50} />
        </div>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Working Days</th>
              <th>Leave Days</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp, idx) => (
              <tr key={idx}>
                <td>{emp.username}</td>
                <td>{emp.role}</td>
                <td>{emp.workingDays}</td>
                <td>{emp.leaveDays}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(emp.username)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="overlay">
          <div className="card-popup">
            <h3>Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="form">
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Employee">Employee</option>
                <option value="HR">HR</option>
                <option value="Admin">Admin</option>
              </select>
              <div className="popup-buttons">
                <button type="submit" className="submit-btn">Add</button>
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
