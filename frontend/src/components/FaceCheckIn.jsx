import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const FaceCheckIn = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [message, setMessage] = useState('Loading models...');
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';

        if (!window.faceapi) {
          setMessage('face-api.js not loaded');
          return;
        }

        await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

        setMessage('Models loaded, starting video...');
        setInitialized(true);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        setMessage('Error loading models or accessing webcam: ' + error.message);
      }
    };

    loadModels();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureAndCheckIn = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setCheckingIn(true);
    setMessage('Capturing face...');

    try {
      // Draw current frame to canvas
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      const blob = await new Promise((resolve) =>
        canvasRef.current.toBlob(resolve, 'image/jpeg', 0.95)
      );

      if (!blob) throw new Error('Failed to capture image');

      setMessage('Getting location...');
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      const { latitude, longitude } = position.coords;

      const formData = new FormData();
      formData.append('faceImage', blob, 'face.jpg');
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      setMessage('Submitting check-in...');
      const res = await axios.post('/api/attendance/check-in', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, // needed if your auth uses cookies
      });

      setMessage(res.data.message || 'Check-in successful!');
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || err.message || 'Check-in failed.');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Face Check-In</h2>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width="480"
        height="360"
        style={{ border: '1px solid black' }}
      />
      <canvas
        ref={canvasRef}
        width="480"
        height="360"
        style={{ display: 'none' }}
      />
      <p>{message}</p>
      <button onClick={captureAndCheckIn} disabled={checkingIn || !initialized}>
        {checkingIn ? 'Checking In...' : 'Check In Now'}
      </button>
    </div>
  );
};

export default FaceCheckIn;
