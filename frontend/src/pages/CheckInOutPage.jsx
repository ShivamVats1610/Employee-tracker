import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './CheckInOutPage.css';

const CheckInOutPage = () => {
  const [locationStatus, setLocationStatus] = useState('');
  const [isInOffice, setIsInOffice] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(false);
  const [checkOutStatus, setCheckOutStatus] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingWebcam, setLoadingWebcam] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const officeCoordinates = { lat: 30.677056, lon: 76.748139 }; // Delhi
  const MAX_DISTANCE_KM = 0.5;

  // Check if running on localhost
  const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  useEffect(() => {
    async function fetchProfileImage(filename) {
      try {
        const url = `http://localhost:8082/api/uploads/profileImages/${filename}`;
        console.log("Fetching image URL:", url);
        const response = await axios.get(url);
        setProfileImage(response.data); // Set profile image here
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    }

    const userProfileImagePath = '1747638890833-497927884.jpg'; // replace accordingly
    fetchProfileImage(userProfileImagePath);
  }, []);

  useEffect(() => {
    if (isLocalhost) {
      // Skip location check silently on localhost
      setIsInOffice(true);
      setLoadingLocation(false);
      setLocationStatus('');
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        setLatitude(lat);
        setLongitude(lon);
        const distance = calculateDistance(officeCoordinates.lat, officeCoordinates.lon, lat, lon);
        setIsInOffice(distance <= MAX_DISTANCE_KM);
        setLocationStatus(
          distance <= MAX_DISTANCE_KM ? '✅ You are in the office area.' : '❌ You are not in the office area.'
        );
        setLoadingLocation(false);
      },
      (err) => {
        setLocationStatus('❌ Unable to retrieve your location.');
        setLoadingLocation(false);
        console.error('Geolocation error:', err);
      },
      { timeout: 10000 }
    );
  }, [isLocalhost]);

  useEffect(() => {
    let stream;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(console.warn);
          };
        }
        setLoadingWebcam(false);
      })
      .catch((err) => {
        alert('❌ Could not access webcam.');
        setLoadingWebcam(false);
        console.error('Webcam error:', err);
      });

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataURL);
  };

  const dataURLtoBlob = (dataurl) => {
    const [prefix, base64Data] = dataurl.split(',');
    const mime = prefix.match(/:(.*?);/)[1];
    const binary = atob(base64Data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new Blob([array], { type: mime });
  };

  const handleCheckIn = async () => {
    if (!capturedImage || !profileImage) {
      alert('❌ Ensure image is captured and profile image is loaded.');
      return;
    }

    if (!isLocalhost && !isInOffice) {
      alert('❌ Ensure you are in the office to check in.');
      return;
    }

    if (!isLocalhost) {
      const now = new Date();
      const hour = now.getHours();
      const minutes = now.getMinutes();
      if (hour > 10 || (hour === 10 && minutes > 0)) {
        alert('❌ Check-in not allowed after 10:00 AM.');
        return;
      }
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('faceImage', dataURLtoBlob(capturedImage), 'captured.jpg');
      if (!isLocalhost) {
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
      }

      const res = await axios.post('http://localhost:8082/api/attendance/check-in', formData, {
        withCredentials: true,
      });

      if (res.status === 200 && res.data.verified) {
        setCheckInStatus(true);
        alert('✅ Face verified. Check-in successful.');
      } else {
        alert('❌ Face does not match profile. Check-in denied.');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      alert('❌ Check-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!isLocalhost && !isInOffice) {
      alert('❌ You must be in the office to check out.');
      return;
    }

    if (!isLocalhost) {
      const now = new Date();
      const hour = now.getHours();
      const minutes = now.getMinutes();
      if (hour < 19 || (hour === 19 && minutes < 30)) {
        alert('❌ Check-out is allowed only after 7:30 PM.');
        return;
      }
    }

    try {
      setIsLoading(true);
      const res = await axios.post('http://localhost:8082/api/attendance/check-out', null, {
        withCredentials: true,
      });

      if (res.status === 200) {
        setCheckOutStatus(true);
        alert('✅ Checked out successfully.');
      }
    } catch (err) {
      console.error('Check-out error:', err);
      alert('❌ Error during check-out.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <img src="/assets/images/bgcheckin.jpg" alt="background" className="background-checkin" />
      <div className="overlay"></div>

      <div className="checkin-container">
        <h1 className="text-white">Employee Check-in / Check-out</h1>
        {/* Show location status only if NOT localhost */}
        {!isLocalhost && (
          <p className={`location-status ${isInOffice ? 'in-office' : 'out-office'}`}>
            {loadingLocation ? 'Fetching location...' : locationStatus}
          </p>
        )}

        {loadingWebcam ? (
          <p>Loading webcam...</p>
        ) : (
          <>
            <video ref={videoRef} style={{ width: '320px', borderRadius: '12px' }} autoPlay muted playsInline />
            <div style={{ margin: '12px 0' }}>
              {!capturedImage ? (
                <button className="check-btn" onClick={captureImage} disabled={isLoading}>
                  📸 Capture Face Image
                </button>
              ) : (
                <button className="check-btn" onClick={() => setCapturedImage(null)} disabled={isLoading}>
                  🔄 Retake Photo
                </button>
              )}
            </div>
          </>
        )}

        {capturedImage && (
          <img src={capturedImage} alt="Captured face" style={{ width: '320px', borderRadius: '12px', marginBottom: '20px' }} />
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {profileImage && (
          <>
            <p className="text-white">👤 Profile Image</p>
            <img src={profileImage} alt="Profile" style={{ width: '120px', borderRadius: '12px', marginBottom: '20px' }} />
          </>
        )}

        <div className="button-group">
          <button
            className="checkin-btn check-btn"
            onClick={handleCheckIn}
            disabled={(!isLocalhost && !isInOffice) || !capturedImage || checkInStatus || isLoading}
          >
            ✅ Check In
          </button>
          <button
            className="checkout-btn check-btn"
            onClick={handleCheckOut}
            disabled={(!isLocalhost && !isInOffice) || checkOutStatus || isLoading}
          >
            ✅ Check Out
          </button>
        </div>

        {checkInStatus && <p style={{ color: 'lightgreen' }}>You have checked in.</p>}
        {checkOutStatus && <p style={{ color: 'lightgreen' }}>You have checked out.</p>}
      </div>
    </>
  );
};

export default CheckInOutPage;
