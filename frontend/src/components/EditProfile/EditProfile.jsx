import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState('/assets/images/default-avatar.jpg');
  const navigate = useNavigate();

  const userId = localStorage.getItem('id');
  const API_BASE_URL = 'http://localhost:8082';

  useEffect(() => {
    if (!userId) {
      setName('');
      setAge('');
      setProfileImage(null);
      setPreview('/assets/images/default-avatar.jpg');
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
          ? `${API_BASE_URL}/api/uploads/${data.profileImage}`
          : '/assets/images/default-avatar.jpg';

        setPreview(imageUrl);

        if (data.profileImage) {
          localStorage.setItem('profileImg', imageUrl);
        } else {
          localStorage.removeItem('profileImg');
        }
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
      });

    // Clean up preview URL object when component unmounts or preview changes from object URL
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [userId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);

      // Revoke previous object URL to avoid memory leaks
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }

      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert('User not logged in.');
      return;
    }

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

        if (data.user && data.user.profileImage) {
          const imageUrl = `${API_BASE_URL}/api/uploads/${data.user.profileImage}`;
          localStorage.setItem('profileImg', imageUrl);
          setPreview(imageUrl); // Update preview to saved image
        }

        alert('Profile updated successfully!');
        navigate('/employee-dashboard');
        // Avoid full reload; React state should update UI
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
