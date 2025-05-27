import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import './CheckInOutPage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082';

const CheckInOutPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [profileDescriptor, setProfileDescriptor] = useState(null);
  const [profileImgPath, setProfileImgPath] = useState(null);

  const employeeId = localStorage.getItem('id');
  const storedProfileImg = localStorage.getItem('profileImg');

  // Build full image URL for face-api fetching
  const getFullImagePath = (imgPath) => {
    if (!imgPath) return '/assets/images/default-avatar.jpg';
    // If already full URL, return as is
    if (imgPath.startsWith('http')) return imgPath;

    // Otherwise, append to uploads path
    return `${API_BASE_URL}/api/uploads/${imgPath}`;
  };

  useEffect(() => {
    // Clean stored profile image path (just filename, no full URL)
    if (storedProfileImg) {
      // Extract filename from stored full URL, if needed
      const filename = storedProfileImg.replace(`${API_BASE_URL}/api/uploads/`, '');
      setProfileImgPath(filename);
    }
  }, [storedProfileImg]);

  useEffect(() => {
    // Load face-api models
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        startVideo();
      } catch (error) {
        console.error('❌ Error loading models:', error);
        alert('Failed to load face recognition models.');
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    // Once models loaded and profile image path ready, load profile face descriptor
    if (modelsLoaded && profileImgPath) {
      loadProfileImageDescriptor();
    }
  }, [modelsLoaded, profileImgPath]);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('❌ Cannot access webcam:', err);
        alert('Webcam access denied or not available.');
      });
  };

  const loadProfileImageDescriptor = async () => {
    try {
      const fullUrl = getFullImagePath(profileImgPath);
      const img = await faceapi.fetchImage(fullUrl);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setProfileDescriptor(detection.descriptor);
        console.log('✅ Profile descriptor loaded');
      } else {
        alert('No face detected in stored profile image.');
      }
    } catch (error) {
      console.error('❌ Failed to load profile image descriptor:', error);
      alert('Could not process profile image for face recognition.');
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
  };

  const verifyFaceMatch = async () => {
    if (!capturedImage) {
      alert('Please capture your face image first.');
      return null;
    }
    if (!profileDescriptor) {
      alert('No profile face data available for comparison.');
      return null;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.src = capturedImage;
      img.onload = async () => {
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          alert('No face detected in the captured image.');
          return resolve(false);
        }

        const distance = faceapi.euclideanDistance(profileDescriptor, detection.descriptor);
        console.log('Face match distance:', distance);
        resolve(distance < 0.55); // Adjust threshold if needed
      };

      img.onerror = () => {
        alert('Failed to load the captured image for face verification.');
        resolve(false);
      };
    });
  };

  const handleCheckInOut = async (action) => {
    const isMatch = await verifyFaceMatch();
    if (isMatch === null) return;
    if (!isMatch) {
      alert('Face does not match your profile. Check-in/out denied.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await axios.post(`${API_BASE_URL}/api/attendance/${action}`, {
            employeeId,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            time: new Date().toISOString(),
          });
          alert(`${action.charAt(0).toUpperCase() + action.slice(1)} successful!`);
        } catch (err) {
          console.error(`${action} failed:`, err);
          alert(`Failed to ${action}. Please try again.`);
        }
      },
      (err) => {
        console.error('Location error:', err);
        alert('Location access denied or unavailable.');
      }
    );
  };

  return (
    <>
      <img src="/assets/images/bgcheckin.jpg" alt="background" className="background-checkin" />
      <div className="overlay" />
      <div className="checkin-container">
        <h2 className="text-white font-bold mb-4">Face Recognition Check-In/Out</h2>

        {modelsLoaded ? (
          <>
            <video ref={videoRef} autoPlay muted className="video-feed" />
            <canvas ref={canvasRef} className="hidden" />

            <div>
              <button onClick={captureImage} className="check-btn">Capture</button>
              <button onClick={() => handleCheckInOut('checkin')} className="check-btn">Check In</button>
              <button onClick={() => handleCheckInOut('checkout')} className="check-btn">Check Out</button>
            </div>

            {capturedImage && (
              <div className="mt-4">
                <h4 className="text-white">Captured Image</h4>
                <img src={capturedImage} alt="Captured" className="captured-img" />
              </div>
            )}
          </>
        ) : (
          <p className="text-white">⏳ Loading face recognition models, please wait...</p>
        )}
      </div>
    </>
  );
};

export default CheckInOutPage;
