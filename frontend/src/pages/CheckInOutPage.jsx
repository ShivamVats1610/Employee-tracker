import React, { useEffect, useRef, useState } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import axios from 'axios';
import './CheckInOutPage.css';
const API_BASE_URL = "https://employee-tracker-ap2x.onrender.com";

const CheckInOutPage = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [detector, setDetector] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [checkInDone, setCheckInDone] = useState(false);
  const [checkOutDone, setCheckOutDone] = useState(false);

  useEffect(() => {
    const empid = localStorage.getItem('empid');
    if (empid) {
      setEmployeeId(empid);
      fetchTodayStatus(empid);
    } else {
      console.warn('empid not found in localStorage');
    }
  }, []);

  const fetchTodayStatus = async (empid) => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/attendance/status?empid=${empid}&date=${today}`);
      if (res.data) {
        setCheckInDone(res.data.checkedIn);
        setCheckOutDone(res.data.checkedOut);
      }
    } catch (err) {
      console.error('Failed to fetch attendance status', err);
    }
  };

  useEffect(() => {
    const loadModelAndStartVideo = async () => {
      const model = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        { runtime: 'tfjs', maxFaces: 1 }
      );
      setDetector(model);
      startVideo();
    };

    loadModelAndStartVideo();
    return () => stopVideo();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => alert('Error accessing webcam'));
  };

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const detectFace = async () => {
    if (!detector || !videoRef.current) return;
    setIsDetecting(true);

    const faces = await detector.estimateFaces(videoRef.current, { flipHorizontal: false });

    if (faces.length > 0) {
      captureImage();
      setFaceDetected(true);
    } else {
      alert('No face detected.');
      setFaceDetected(false);
    }

    setIsDetecting(false);
  };

  const captureImage = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
  };

  const isProduction = () => window.location.hostname !== 'localhost';

  const dataURLtoBlob = (dataURL) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleCheckInOut = (action) => {
    if (!faceDetected) return alert('Detect your face first.');
    if (!employeeId) return alert('Employee ID not found.');

    if ((action === 'Check In' && checkInDone) || (action === 'Check Out' && checkOutDone)) {
      return alert(`Already ${action.toLowerCase()}ed today.`);
    }

    const date = new Date().toISOString().slice(0, 10);
    const time = new Date().toLocaleTimeString('en-GB');

    const saveAttendance = (location) => {
      const formData = new FormData();
      formData.append('empid', employeeId);
      formData.append('date', date);
      formData.append('time', time);
      formData.append('action', action);

      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      if (capturedImage) {
        const imageBlob = dataURLtoBlob(capturedImage);
        formData.append('image', imageBlob, 'face.png');
      }

      axios.post('${API_BASE_URL}/api/attendance/log', formData)
        .then(() => {
          alert(`${action} saved.`);
          if (action === 'Check In') setCheckInDone(true);
          if (action === 'Check Out') setCheckOutDone(true);
        })
        .catch(err => {
          console.error(err);
          alert('Failed to save attendance.');
        });
    };

    if (isProduction()) {
      if (!navigator.geolocation) return alert('Geolocation not supported.');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          saveAttendance(location);
        },
        () => alert('Location unavailable.')
      );
    } else {
      saveAttendance(null);
    }
  };

  return (
    <div style={{
      backgroundImage: 'url(/assets/images/bgcheckin.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: 20,
      color: 'white',
      textAlign: 'center'
    }}>
      <h2>Face Recognition Check-In/Out</h2>

      <video ref={videoRef} autoPlay muted width="320" height="240" style={{ borderRadius: '10px' }} />

      <div style={{ margin: '10px' }}>
        <button onClick={detectFace} disabled={isDetecting}>
          {isDetecting ? 'Detecting...' : 'Detect Face & Capture'}
        </button>
      </div>

      {capturedImage && (
        <img src={capturedImage} alt="Captured Face" width="160" style={{ borderRadius: '10px' }} />
      )}

      <div style={{ marginTop: '20px' }}>
        <button onClick={() => handleCheckInOut('Check In')} disabled={!faceDetected || checkInDone}>
          {checkInDone ? 'Already Checked In' : 'Check In'}
        </button>
        <button
          onClick={() => handleCheckInOut('Check Out')}
          disabled={!faceDetected || checkOutDone}
          style={{ marginLeft: '10px' }}
        >
          {checkOutDone ? 'Already Checked Out' : 'Check Out'}
        </button>
      </div>

      {!faceDetected && <p>Please detect your face before checking in or out.</p>}
    </div>
  );
};

export default CheckInOutPage;
