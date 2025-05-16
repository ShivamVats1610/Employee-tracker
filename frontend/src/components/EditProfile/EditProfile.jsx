import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [preview, setPreview] = useState('assets/images/default-avatar.png');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setName('');
      setAge('');
      setProfileImage('');
      setPreview('assets/images/default-avatar.png');
      return;
    }

    fetch('/api/user/profile', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setAge(data.age || '');
        const username = data.username || localStorage.getItem('username') || '';
        setName(username);
        localStorage.setItem('username', username);

        const imageUrl = data.profileImage || 'assets/images/default-avatar.png';
        setProfileImage(imageUrl);
        setPreview(imageUrl);
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
      });
  }, [token]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        const res = await fetch('/api/user/upload-profile-image', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (data.imageUrl) {
          setPreview(data.imageUrl);
          setProfileImage(data.imageUrl);
        }
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: name,
          age,
          profileImage,
        }),
      });

      if (res.ok) {
        localStorage.setItem('username', name);
        localStorage.setItem('profileImg', profileImage);
        alert('Profile updated successfully!');
        navigate('/employee-dashboard');
        window.location.reload();
      } else {
        alert('Failed to update profile.');
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
