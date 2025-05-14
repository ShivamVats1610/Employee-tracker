import React, { useState } from 'react';
import './ApplyLeavePage.css';
import axios from 'axios';

const ApplyLeavePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    phone: '',
    reason: '',
    date: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/leaves/apply', formData);
      alert('Leave applied successfully!');
      setFormData({ name: '', employeeId: '', phone: '', reason: '', date: '' });
    } catch (error) {
      console.error('Error applying leave:', error);
      alert('Error applying leave');
    }
  };

  return (
    <div className="leave-container">
      <h2>Apply for Leave</h2>
      <form className="leave-form" onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
        <input type="text" name="employeeId" placeholder="Employee ID" value={formData.employeeId} onChange={handleChange} required />
        <input type="tel" name="phone" placeholder="Contact Number" value={formData.phone} onChange={handleChange} required />
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        <textarea
          name="reason"
          placeholder="Reason for Leave"
          value={formData.reason}
          onChange={handleChange}
          rows="4"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ApplyLeavePage;
