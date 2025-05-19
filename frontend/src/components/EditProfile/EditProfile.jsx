import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [profileImage, setProfileImage] = useState(null); // store file
  const [preview, setPreview] = useState('assets/images/default-avatar.png');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:8082'; // backend server URL

  useEffect(() => {
    if (!token) {
      setName('');
      setAge('');
      setProfileImage(null);
      setPreview('assets/images/default-avatar.png');
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/profile`, {  // <-- Make sure this route matches your backend (see note below)
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(data => {
        setAge(data.age || '');
        const username = data.username || localStorage.getItem('username') || '';
        setName(username);
        localStorage.setItem('username', username);

        const imageUrl = data.profileImage
          ? `${API_BASE_URL}/uploads/${data.profileImage}`  // Use full URL for image preview
          : 'assets/images/default-avatar.png';

        setPreview(imageUrl);
        setUserId(data._id); // Get userId for PUT request
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
      });
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file); // Save file to state
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL); // Instant preview
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('age', age);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/update-profile`,  {
        method: 'PUT',
        headers: {
  'Authorization': `Bearer ${token}`,
  // Do NOT manually set Content-Type for FormData
},
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('username', name);
        alert('Profile updated successfully!');
        navigate('/employee-dashboard');
        window.location.reload();
      } else {
        alert(data.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating profile.');
    }
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        <h2>Edit Profile</h2>
        <div className="profile-image-preview">
          <img src={preview} alt="Profile Preview" />
        </div>
        <form onSubmit={handleSave}>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />

          <label>Age:</label>
          <input
            type="number"
            value={age}
            required
            min="1"
            onChange={(e) => setAge(e.target.value)}
          />

          <label>Upload New Profile Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
