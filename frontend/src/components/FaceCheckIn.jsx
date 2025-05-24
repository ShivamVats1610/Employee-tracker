import React, { useEffect, useRef, useState } from 'react';

const FaceCheckIn = () => {
  const videoRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [message, setMessage] = useState('Loading models...');

  useEffect(() => {
    // Load face-api models
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'; // Your models folder path

        await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

        setMessage('Models loaded, starting video...');
        setInitialized(true);
        startVideo();
      } catch (error) {
        setMessage('Error loading models: ' + error.message);
      }
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          setMessage('Error accessing webcam: ' + err.message);
        });
    };

    loadModels();

    // Cleanup video stream on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const video = videoRef.current;
    let intervalId;

    const detectFaces = async () => {
      if (!video || video.paused || video.ended) return;

      try {
        const detections = await window.faceapi
          .detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detections.length > 0) {
          setMessage(
            `Face detected! Expressions: ${JSON.stringify(detections[0].expressions)}`
          );
          // Add your check-in logic here
        } else {
          setMessage('No face detected');
        }
      } catch (error) {
        setMessage('Face detection error: ' + error.message);
      }
    };

    const startDetection = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(detectFaces, 1000);
    };

    // If video is already playing, start detection immediately
    if (video && !video.paused) {
      startDetection();
    }

    // Add play event listener to start detection when video starts
    video.addEventListener('play', startDetection);

    return () => {
      clearInterval(intervalId);
      video.removeEventListener('play', startDetection);
    };
  }, [initialized]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Face Check-In</h2>
      <video
        ref={videoRef}
        autoPlay
        muted
        width="480"
        height="360"
        style={{ border: '1px solid black' }}
      />
      <p>{message}</p>
    </div>
  );
};

export default FaceCheckIn;
