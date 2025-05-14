import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CheckInOutPage = () => {
  const [locationStatus, setLocationStatus] = useState('Fetching location...');
  const [isInOffice, setIsInOffice] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(false);
  const [checkOutStatus, setCheckOutStatus] = useState(false);

  const officeCoordinates = {
    lat: 28.7041,
    lon: 77.1025
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(
          officeCoordinates.lat,
          officeCoordinates.lon,
          latitude,
          longitude
        );

        if (distance <= 1) {
          setIsInOffice(true);
          setLocationStatus('✅ You are in the office area.');
        } else {
          setIsInOffice(false);
          setLocationStatus('❌ You are not in the office area.');
        }
      },
      (error) => {
        setLocationStatus('Error getting location: ' + error.message);
        setIsInOffice(false);
      }
    );
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCheckIn = async () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    if (!isInOffice) {
      alert('You must be in the office area to check in.');
      return;
    }

    if (hour < 10 || (hour === 10 && minutes === 0)) {
      try {
        await axios.post('/api/checkin', { status: 'checked-in' });
        setCheckInStatus(true);
        alert('✅ Checked in successfully!');
      } catch (err) {
        alert('❌ Error during check-in.');
      }
    } else {
      alert('❌ You are too late to check in.');
    }
  };

  const handleCheckOut = async () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    if (!isInOffice) {
      alert('You must be in the office area to check out.');
      return;
    }

    if (hour > 19 || (hour === 19 && minutes >= 30)) {
      try {
        await axios.post('/api/checkout', { status: 'checked-out' });
        setCheckOutStatus(true);
        alert('✅ Checked out successfully!');
      } catch (err) {
        alert('❌ Error during check-out.');
      }
    } else {
      alert('❌ You cannot check out before 7:30 PM.');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>Employee Check-in/Check-out</h1>
      <p style={{ fontWeight: 'bold', color: isInOffice ? 'green' : 'red' }}>{locationStatus}</p>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleCheckIn} disabled={checkInStatus}>
          ✅ Check In
        </button>
        &nbsp;&nbsp;
        <button onClick={handleCheckOut} disabled={checkOutStatus}>
          🔁 Check Out
        </button>
      </div>
    </div>
  );
};

export default CheckInOutPage;
