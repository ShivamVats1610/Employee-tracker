import React, { useEffect, useState } from 'react';
import './Leaves.css';
import axios from 'axios';

const BASE_URL = 'http://localhost:8082';

const HRLeavePage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/leaves/requests`);
        setLeaveRequests(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching leave requests:', err);
        setError('Failed to load leave requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, []);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await axios.post(`${BASE_URL}/api/leaves/approve/${id}`);
      setLeaveRequests((prev) => prev.filter((request) => request._id !== id));
    } catch (err) {
      console.error('Error approving leave:', err);
      alert('Failed to approve leave.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleNotApprove = async (id) => {
    setProcessingId(id);
    try {
      await axios.post(`${BASE_URL}/api/leaves/reject/${id}`);
      setLeaveRequests((prev) => prev.filter((request) => request._id !== id));
    } catch (err) {
      console.error('Error rejecting leave:', err);
      alert('Failed to reject leave.');
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ Helper function for document URL
  const getFullDocumentPath = (docPath) => {
    return docPath ? `http://localhost:8082/uploads/leaveDocs/${docPath}` : null;
  };


  if (loading) return <p>Loading leave requests...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <img src="/assets/images/bgApplyleave.jpg" alt="background" className="background-leave-hr" />
      <div className="hr-leave-container">
        <h2>Employee Leave Requests</h2>
        {leaveRequests.length === 0 ? (
          <p>No leave requests found.</p>
        ) : (
          <div className="leave-table" role="table" aria-label="Leave Requests">
            <div className="table-header" role="rowgroup">
              <div className="column header" role="columnheader">Employee Name</div>
              <div className="column header" role="columnheader">Employee ID</div>
              <div className="column header" role="columnheader">Phone</div>
              <div className="column header" role="columnheader">Leave Date</div>
              <div className="column header" role="columnheader">Reason</div>
              <div className="column header" role="columnheader">Document</div>
              <div className="column header" role="columnheader">Actions</div>
            </div>
            <div role="rowgroup">
              {leaveRequests.map((request) => (
                <div className="table-row" role="row" key={request._id}>
                  <div className="column" role="cell">{request.name}</div>
                  <div className="column" role="cell">{request.employeeId}</div>
                  <div className="column" role="cell">{request.phone}</div>
                  <div className="column" role="cell">
                    {new Date(request.date).toLocaleDateString()}
                  </div>
                  <div className="column" role="cell">{request.reason}</div>
                  <div className="column" role="cell">
                    {request.document ? (
                      <img
                        src={`http://localhost:8082/uploads/leaveDocs/${request.document}`}
                        alt="Leave document"
                        className="document-preview"
                      />
                    ) : (
                      <span>No document</span>
                    )}
                  </div>
                  <div className="column actions" role="cell">
                    <button
                      onClick={() => handleApprove(request._id)}
                      aria-label={`Approve leave for ${request.name}`}
                      disabled={processingId === request._id}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleNotApprove(request._id)}
                      aria-label={`Reject leave for ${request.name}`}
                      disabled={processingId === request._id}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HRLeavePage;
