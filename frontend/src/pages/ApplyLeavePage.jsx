import React, { useState, useEffect } from 'react';
import './ApplyLeavePage.css';
import axios from 'axios';

const ApplyLeavePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    phone: '',
    reason: '',
    date: '',
    document: null,
  });

  const [leaveRequests, setLeaveRequests] = useState([]);

  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(0, i);
    return {
      label: date.toLocaleString('default', { month: 'long' }),
      value: String(i + 1).padStart(2, '0'),
    };
  });

  const fetchLeaveRequests = async (employeeId) => {
    try {
      const res = await axios.get(`/api/leaves/${employeeId}`);
      setLeaveRequests(res.data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'document') {
      setFormData((prev) => ({ ...prev, document: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      await axios.post('/api/leaves/apply', data);
      alert('Leave applied successfully!');
      fetchLeaveRequests(formData.employeeId); // Refresh list
      setFormData({
        name: '',
        employeeId: '',
        phone: '',
        reason: '',
        date: '',
        document: null,
      });
    } catch (error) {
      console.error('Error applying leave:', error);
      alert('Error applying leave');
    }
  };

  useEffect(() => {
    if (formData.employeeId) {
      fetchLeaveRequests(formData.employeeId);
    }
  }, [formData.employeeId]);

  // Filter leaves by selected month
  const filteredLeaves = leaveRequests.filter(
    (leave) => new Date(leave.date).getMonth() + 1 === parseInt(selectedMonth)
  );

  return (
    
    <>
  <img src="/assets/images/bgApplyleave.jpg" alt="background" className="background-leave" />
  <div className="leave-container">
      <div className="form-card glass">
        <h2>Apply for Leave</h2>
        <form className="leave-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="employeeId" placeholder="Employee ID" value={formData.employeeId} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder="Contact Number" value={formData.phone} onChange={handleChange} required />
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          <textarea name="reason" placeholder="Reason for Leave" value={formData.reason} onChange={handleChange} rows="4" required />
          <div className="file-upload">
  <label htmlFor="document"><strong>Upload Documents:</strong></label>
  <input type="file" id="document" name="document" onChange={handleChange} accept=".pdf,.jpg,.png" />
  {formData.document && <span className="file-name">{formData.document.name}</span>}
</div>
          <button type="submit">Submit</button>
        </form>
      </div>

      <div className="summary-card glass">
        <h3>Leave Request</h3>

        <div className="leave-info">
          <div className="info-header">
            <h4>Leave Request Info</h4>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {filteredLeaves.length === 0 ? (
            <p>No leave requests found for this month.</p>
          ) : (
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((leave, index) => (
                  <tr key={index}>
                    <td>{new Date(leave.date).toLocaleDateString()}</td>
                    <td>{leave.reason}</td>
                    <td className={leave.status.toLowerCase()}>{leave.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default ApplyLeavePage;
