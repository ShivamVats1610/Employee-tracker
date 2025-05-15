import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CheckInOutPage = () => {
  const [locationStatus, setLocationStatus] = useState('Fetching location...');
  const [isInOffice, setIsInOffice] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(false);
  const [checkOutStatus, setCheckOutStatus] = useState(false);

  const officeCoordinates = {
    lat: 28.7041,
    lon: 77.1025,
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
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
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
    <>
      <div className="background-checkin"></div>
      <div className="overlay"></div>

      <div className="checkin-container">
        <h1 class="text-white">Employee Check-in / Check-out</h1>
        <p className={`location-status ${isInOffice ? 'in-office' : 'out-office'}`}>
          {locationStatus}
        </p>

        <div className="buttons">
          <button onClick={handleCheckIn} disabled={checkInStatus}>
            ✅ Check In
          </button>
          <button onClick={handleCheckOut} disabled={checkOutStatus}>
            🔁 Check Out
          </button>
        </div>
      </div>

      <style jsx>{`
        .background-checkin {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('/assets/images/bgcheckin.jpg'); /* Change this */
          background-size: cover;
          background-position: center;
          z-index: -3;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.45);
          z-index: -2;
        }

        .checkin-container {
          max-width: 420px;
          margin: 60px auto;
          background: rgba(30, 30, 30, 0.17);
          padding: 40px 30px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
          color: #fff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          text-align: center;
        }

        h1 {
          margin-bottom: 24px;
          font-weight: 700;
          font-size: 1.8rem;
          letter-spacing: 1.3px;
        }

        .location-status {
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 32px;
          user-select: none;
        }

        .in-office {
          color: #4caf50; /* green */
        }

        .out-office {
          color: #f44336; /* red */
        }

        .buttons {
          display: flex;
          justify-content: center;
          gap: 24px;
        }

        button {
          background: linear-gradient(90deg, #ff5722, #ff7043);
          border: none;
          border-radius: 30px;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          padding: 14px 36px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgb(255 87 34 / 0.5);
          transition: background 0.3s ease;
          min-width: 130px;
          user-select: none;
        }

        button:disabled {
          background: #777;
          cursor: not-allowed;
          box-shadow: none;
          color: #ccc;
        }

        button:not(:disabled):hover {
          background: linear-gradient(90deg, #ff7043, #ff5722);
          box-shadow: 0 6px 18px rgb(255 112 67 / 0.7);
        }
      `}</style>
    </>
  );
};

export default CheckInOutPage;
