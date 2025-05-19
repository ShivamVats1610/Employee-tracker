import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState('assets/images/default-avatar.jpg');
  const navigate = useNavigate();

  const userId = localStorage.getItem('id');
  const API_BASE_URL = 'http://localhost:8082';

  useEffect(() => {
    if (!userId) {
      setName('');
      setAge('');
      setProfileImage(null);
      setPreview('assets/images/default-avatar.png');
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/profile/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(data => {
        setAge(data.age || '');
        const username = data.name || localStorage.getItem('username') || '';
        setName(username);
        localStorage.setItem('username', username);

        const imageUrl = data.profileImage
          ? `${API_BASE_URL}/api/uploads/${data.profileImage}`  // 🔁 updated path
          : 'assets/images/default-avatar.png';

        setPreview(imageUrl);

        if (data.profileImage) {
          localStorage.setItem('profileImg', imageUrl);
        }
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
      });
  }, [userId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
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
      const res = await fetch(`${API_BASE_URL}/api/auth/update-profile/${userId}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('username', name);

        if (data.updatedUser && data.updatedUser.profileImage) {
          const imageUrl = `${API_BASE_URL}/api/uploads/${data.updatedUser.profileImage}`; // 🔁 updated path
          localStorage.setItem('profileImg', imageUrl);
        }

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
