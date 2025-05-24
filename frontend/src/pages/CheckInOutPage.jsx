import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './CheckInOutPage.css';

const CheckInOutPage = () => {
  const [locationStatus, setLocationStatus] = useState('Fetching location...');
  const [isInOffice, setIsInOffice] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState(false);
  const [checkOutStatus, setCheckOutStatus] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingWebcam, setLoadingWebcam] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const officeCoordinates = { lat: 28.7041, lon: 77.1025 }; // Delhi coordinates

  useEffect(() => {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      setLocationStatus('Running on localhost: skipping location check.');
      setIsInOffice(true);
      setLoadingLocation(false);
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        setLatitude(lat);
        setLongitude(lon);

        const distance = calculateDistance(
          officeCoordinates.lat,
          officeCoordinates.lon,
          lat,
          lon
        );

        setIsInOffice(distance <= 1);
        setLocationStatus(
          distance <= 1
            ? '✅ You are in the office area.'
            : '❌ You are not in the office area.'
        );
        setLoadingLocation(false);
      },
      (error) => {
        setLocationStatus('Unable to retrieve your location.');
        setIsInOffice(false);
        setLoadingLocation(false);
        console.error('Geolocation error:', error);
      },
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    let stream;
    if (navigator.mediaDevices?.getUserMedia) {
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
          alert('Could not access webcam.');
          setLoadingWebcam(false);
          console.error('Webcam error:', err);
        });
    } else {
      alert('Webcam not supported.');
      setLoadingWebcam(false);
    }

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
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
    if (!isInOffice || !capturedImage) {
      alert('❌ Please ensure you are in the office and captured your image.');
      return;
    }

    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isLocalhost && (hour > 10 || (hour === 10 && minutes > 0))) {
      alert('❌ Check-in not allowed after 10:00 AM.');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('faceImage', dataURLtoBlob(capturedImage), 'face.jpg');
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      // Use full backend URL
      const response = await axios.post('http://localhost:8082/api/attendance/checkin', formData);

      if (response.status === 200) {
        setCheckInStatus(true);
        alert('✅ Face verified. Check-in successful.');
      } else {
        alert('❌ Check-in failed. Please try again.');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('❌ Something went wrong during check-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!isInOffice) {
      alert('You must be in the office to check out.');
      return;
    }

    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    if (hour < 19 || (hour === 19 && minutes < 30)) {
      alert('❌ Check-out is allowed only after 7:30 PM.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post('http://localhost:8082/api/attendance/checkout');
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
        <p className={`location-status ${isInOffice ? 'in-office' : 'out-office'}`}>
          {loadingLocation ? 'Fetching location...' : locationStatus}
        </p>

        {loadingWebcam ? (
          <p>Loading webcam...</p>
        ) : (
          <>
            <video ref={videoRef} style={{ width: '320px', borderRadius: '12px' }} autoPlay muted playsInline />
            <div style={{ margin: '12px 0' }}>
              {!capturedImage ? (
                <button class="check-btn" onClick={captureImage} disabled={!isInOffice || isLoading}>📸 Capture Face Image</button>
              ) : (
                <button class="check-btn"  onClick={() => setCapturedImage(null)} disabled={isLoading}>🔄 Retake Photo</button>
              )}
            </div>
          </>
        )}

        {capturedImage && (
          <img src={capturedImage} alt="Captured face" style={{ width: '320px', borderRadius: '12px', marginBottom: '20px' }} />
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div className="button-group">
          <button class="check-btn"  className="checkin-btn" onClick={handleCheckIn} disabled={!isInOffice || !capturedImage || checkInStatus || isLoading}>
            ✅ Check In
          </button>
          <button class="check-btn"  className="checkout-btn" onClick={handleCheckOut} disabled={!isInOffice || checkOutStatus || isLoading}>
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
