import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import './CheckInOutPage.css'; // Make sure your CSS matches this

const CheckInOutPage = () => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [profileDescriptor, setProfileDescriptor] = useState(null);

  const employeeId = localStorage.getItem('employeeId');

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log('✅ Models loaded.');
        setModelsLoaded(true);
        startVideo();
      } catch (err) {
        console.error('❌ Error loading models:', err);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoaded && employeeId) {
      fetchProfileImage();
    }
  }, [modelsLoaded, employeeId]);

  const startVideo = () => {
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error('❌ Error accessing webcam:', err);
          alert('❌ Cannot access webcam.');
        });
    }
  };

  const fetchProfileImage = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/employees/${employeeId}`);
      const imageUrl = response.data.profileImage;
      const img = await faceapi.fetchImage(imageUrl);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setProfileDescriptor(detection.descriptor);
        console.log('✅ Profile descriptor loaded.');
      } else {
        alert('⚠️ No face detected in profile image.');
      }
    } catch (error) {
      console.error('❌ Error fetching profile image:', error);
      alert('❌ Could not load profile image.');
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
  };

  const verifyFaceMatch = async () => {
    if (!capturedImage) {
      alert('⚠️ Please capture an image first.');
      return null;
    }
    if (!profileDescriptor) {
      alert('⚠️ No profile image found or face not detected in profile.');
      return null;
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.src = capturedImage;

      img.onload = async () => {
        try {
          const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (!detection) {
            alert('❌ No face detected in captured image.');
            return resolve(false);
          }

          const distance = faceapi.euclideanDistance(profileDescriptor, detection.descriptor);
          console.log('Face match distance:', distance);
          resolve(distance < 0.55);
        } catch (err) {
          console.error('❌ Error during face match:', err);
          alert('❌ Face detection failed.');
          resolve(false);
        }
      };

      img.onerror = () => {
        alert('❌ Failed to load captured image.');
        resolve(false);
      };
    });
  };

  const handleCheckInOut = async (action) => {
    const match = await verifyFaceMatch();
    if (match === null) return; // Missing image or descriptor, stop here
    if (!match) {
      alert('❌ Face does not match. Check-in/out denied.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await axios.post(`http://localhost:5000/api/attendance/${action}`, {
            employeeId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            time: new Date().toISOString(),
          });
          alert(`✅ ${action} successful.`);
        } catch (error) {
          console.error(`❌ Error during ${action}:`, error);
          alert(`❌ ${action} failed.`);
        }
      },
      (err) => {
        console.error('❌ Geolocation error:', err);
        alert('❌ Location access denied.');
      }
    );
  };

  return (
    <>
      <img src="/assets/images/bgcheckin.jpg" alt="background" className="background-checkin" />
      <div className="overlay"></div>

      <div className="checkin-container">
        <h2 className="text-white font-bold mb-4">Face Recognition Check-In/Out</h2>

        {modelsLoaded ? (
          <>
            <video ref={videoRef} autoPlay muted className="video-feed" />
            <canvas ref={canvasRef} className="hidden" />

            <div className="location-status">
              {/* dynamic location status if needed */}
              Location status will show here
            </div>

            <div>
              <button onClick={captureImage} className="check-btn">
                Capture
              </button>
              <button onClick={() => handleCheckInOut('checkin')} className="check-btn">
                Check In
              </button>
              <button onClick={() => handleCheckInOut('checkout')} className="check-btn">
                Check Out
              </button>
            </div>

            {capturedImage && (
              <div className="mt-4">
                <h4 className="text-white">Captured Image</h4>
                <img src={capturedImage} alt="Captured" className="captured-img" />
              </div>
            )}
          </>
        ) : (
          <p className="text-white">❌ Please wait while the models load...</p>
        )}
      </div>
    </>
  );
};

export default CheckInOutPage;
