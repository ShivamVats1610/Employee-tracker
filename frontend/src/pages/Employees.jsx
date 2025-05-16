import React, { useState, useEffect } from 'react';
import './Employees.css';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Employee',
  });

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/employees');
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (username) => {
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;
    try {
      const res = await fetch(`http://localhost:8082/api/employees/${username}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEmployees(employees.filter((emp) => emp.username !== username));
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
      const res = await fetch('http://localhost:8082/api/auth/register', {
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
      <div className="header">
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
