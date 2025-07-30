import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs'; // ✅ MUST BE FIRST
import * as faceapi from 'face-api.js';

const FaceCompareTest = () => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [result, setResult] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const setupAndLoadModels = async () => {
      try {
        // Set TensorFlow backend explicitly to 'cpu'
        await tf.setBackend('cpu');
        await tf.ready();
        console.log('TensorFlow backend set to CPU');

        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log('✅ Models loaded');
        setModelsLoaded(true);
      } catch (err) {
        console.error('❌ Failed to set backend or load models:', err);
      }
    };

    setupAndLoadModels();
  }, []);

  const handleImageChange = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setImage(imgURL);
    }
  };

  const handleCompare = async () => {
    if (!modelsLoaded) {
      alert('Models not loaded yet.');
      return;
    }

    if (!image1 || !image2) {
      alert('⚠️ Please upload both images.');
      return;
    }

    try {
      const img1 = await faceapi.fetchImage(image1);
      const img2 = await faceapi.fetchImage(image2);

      const detection1 = await faceapi
        .detectSingleFace(img1, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      const detection2 = await faceapi
        .detectSingleFace(img2, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection1?.descriptor || !detection2?.descriptor) {
        setResult('❌ Face not detected in one or both images.');
        return;
      }

      const distance = faceapi.euclideanDistance(
        detection1.descriptor,
        detection2.descriptor
      );

      setResult(
        distance < 0.55
          ? `✅ Faces match! (Distance: ${distance.toFixed(4)})`
          : `❌ Faces do not match. (Distance: ${distance.toFixed(4)})`
      );
    } catch (err) {
      console.error('Comparison failed:', err);
      setResult('❌ An error occurred during comparison.');
    }
  };

  return (
    <div style={{ padding: '20px', color: 'white', background: '#222', minHeight: '100vh' }}>
      <h2>Test Face Matching with face-api.js</h2>

      <div>
        <label>Upload Image 1:</label>
        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setImage1)} />
      </div>
      <div>
        <label>Upload Image 2:</label>
        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setImage2)} />
      </div>

      <button onClick={handleCompare} style={{ marginTop: '10px', padding: '8px 16px' }}>
        Compare Faces
      </button>

      <div style={{ marginTop: '20px' }}>
        {image1 && <img src={image1} alt="Image 1" width="150" />}
        {image2 && <img src={image2} alt="Image 2" width="150" style={{ marginLeft: '20px' }} />}
      </div>

      <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{result}</p>
    </div>
  );
};

export default FaceCompareTest;
