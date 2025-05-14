import React, { useEffect, useState } from 'react';
import './Leaves.css';
import axios from 'axios';

const HRLeavePage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get('/api/leaves/requests');
        setLeaveRequests(response.data);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };
    fetchLeaveRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/leaves/approve/${id}`);
      setLeaveRequests(leaveRequests.filter(request => request.id !== id)); // Remove approved request
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleNotApprove = async (id) => {
    try {
      await axios.post(`/api/leaves/reject/${id}`);
      setLeaveRequests(leaveRequests.filter(request => request.id !== id)); // Remove rejected request
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  return (
    <div className="hr-leave-container">
      <h2>Employee Leave Requests</h2>
      <div className="leave-table">
        <div className="table-header">
          <div className="column">Employee Name</div>
          <div className="column">Employee ID</div>
          <div className="column">Phone</div>
          <div className="column">Leave Date</div>
          <div className="column">Reason</div>
          <div className="column">Actions</div>
        </div>
        {leaveRequests.map(request => (
          <div className="table-row" key={request.id}>
            <div className="column">{request.name}</div>
            <div className="column">{request.employeeId}</div>
            <div className="column">{request.phone}</div>
            <div className="column">{request.date}</div>
            <div className="column">{request.reason}</div>
            <div className="column actions">
              <button onClick={() => handleApprove(request.id)}>Approve</button>
              <button onClick={() => handleNotApprove(request.id)}>Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HRLeavePage;
