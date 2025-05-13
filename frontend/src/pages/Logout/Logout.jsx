import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Logout.css';
const Logout = ({ setRole }) => {
  const navigate = useNavigate();

  useEffect(() => {
    setRole(null);
    navigate('/');
  }, [setRole, navigate]);

  
return <div className="logout-message">Logging out...</div>;

};

export default Logout;
