import React, { useState, useEffect } from 'react';
import { Box, Grid, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getSocietyProfile, updateSocietyProfile } from '../../services/apiService';
import PopupModal from '../../components/common/PopupModal';

const SocietyProfileEdit = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: '',
    description: '',
    location: '',
    available_plots: '',
    price_range: ''
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Popup modal state
  const [popup, setPopup] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Check authentication and load existing profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setMessage('Please log in to access this page');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setInitialLoading(true);
      console.log('[PROFILE EDIT] Loading existing profile for editing...');
      
      const result = await getSocietyProfile();
      console.log('[PROFILE EDIT] Profile data loaded:', result);
      
      if (result.success && result.profile) {
        setProfile({
          name: result.profile.name || '',
          description: result.profile.description || '',
          location: result.profile.location || '',
          available_plots: result.profile.available_plots || '',
          price_range: result.profile.price_range || ''
        });
        
        // Set logo if exists
        if (result.profile.society_logo) {
          setLogoPreview(result.profile.society_logo);
        }
        
        console.log('[PROFILE EDIT] Profile data set for editing');
      } else {
        setMessage('Failed to load profile data for editing');
        showPopup(
          'Error',
          'Could not load your profile data. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error('[PROFILE EDIT] Error loading profile:', error);
      
      if (error.message.includes('Authentication failed')) {
        showPopup(
          'Session Expired',
          'Your session has expired. Please log in again.',
          'warning'
        );
        
        setTimeout(() => {
          closePopup();
          navigate('/login');
        }, 3000);
      } else {
        setMessage('Failed to load profile data: ' + error.message);
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle logo file selection
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate image format (PNG, JPG, JPEG)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setMessage('Please select a PNG, JPG, or JPEG file for the logo');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Logo file size must be less than 5MB');
        return;
      }
      
      setLogo(file);
      setMessage(''); // Clear any previous errors
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Show popup modal
  const showPopup = (title, message, type = 'info') => {
    setPopup({
      isOpen: true,
      title,
      message,
      type
    });
  };

  // Close popup modal
  const closePopup = () => {
    setPopup({
      isOpen: false,
      title: '',
      message: '',
      type: 'info'
    });
  };

  // Handle cancel - go back to profile view
  const handleCancel = () => {
    console.log('[PROFILE EDIT] User cancelled editing, returning to profile view');
    navigate('/subadmin/society-profile');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      console.log('[PROFILE EDIT] Submitting profile updates...');
      
      // Simple validation
      const requiredFields = ['name', 'description', 'location', 'available_plots', 'price_range'];
      for (let field of requiredFields) {
        if (!profile[field].trim()) {
          setMessage(`Please fill in ${field.replace('_', ' ')}`);
          setLoading(false);
          return;
        }
      }
      
      if (!logo && !logoPreview) {
        setMessage('Please upload a logo');
        setLoading(false);
        return;
      }
      
      // Create FormData
      const formData = new FormData();
      Object.keys(profile).forEach(key => {
        formData.append(key, profile[key]);
      });
      
      if (logo) {
        formData.append('society_logo', logo);
      }
      
      const result = await updateSocietyProfile(formData);
      
      console.log('[PROFILE EDIT] Update response:', {
        success: result.success,
        is_complete: result.is_complete,
        message: result.message,
        error: result.error
      });
      
      if (result.success) {
        console.log('[PROFILE EDIT] Profile updated successfully, returning to profile view');
        
        showPopup(
          'Profile Updated!',
          'Your society profile has been updated successfully.',
          'success'
        );
        
        // Always return to society profile page after editing
        setTimeout(() => {
          console.log('[PROFILE EDIT] Navigating back to /subadmin/society-profile');
          closePopup();
          navigate('/subadmin/society-profile');
        }, 2000);
        
      } else {
        setMessage(result.error || 'Failed to update profile');
      }
      
    } catch (error) {
      console.error('[PROFILE EDIT] Update error:', error);
      if (error.message.includes('Authentication')) {
        setMessage('Session expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(error.message || 'Update failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while loading profile data
  if (initialLoading) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" color="textSecondary">Loading profile for editing...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#f5f5f5', p: 3 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#2F3D57', fontWeight: 700, mb: 2, textAlign: 'center' }}>
            Edit Society Profile
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', mb: 3, textAlign: 'center' }}>
            Update your society information below
          </Typography>

          {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              
              {/* Basic Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#2F3D57', fontWeight: 600, mb: 2, borderBottom: '2px solid #ED7600', pb: 1 }}>
                  Society Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Society Name"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Location"
                  value={profile.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Available Plots"
                  value={profile.available_plots}
                  onChange={(e) => handleInputChange('available_plots', e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g. 5 Marla, 10 Marla, 1 Kanal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Price Range"
                  value={profile.price_range}
                  onChange={(e) => handleInputChange('price_range', e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g. 50L - 1Cr"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={profile.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  placeholder="Describe your society, its features, and what makes it special..."
                />
              </Grid>

              {/* Logo Upload Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#2F3D57', fontWeight: 600, mb: 2, borderBottom: '2px solid #ED7600', pb: 1, mt: 2 }}>
                  Society Logo
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/png,image/jpeg,image/jpg"
                    style={{ display: 'none' }}
                    id="logo-upload"
                    type="file"
                    onChange={handleLogoChange}
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      sx={{ mr: 2 }}
                    >
                      {logoPreview ? 'Change Logo' : 'Upload Logo'} (PNG/JPG)
                    </Button>
                  </label>
                  <Typography variant="caption" color="textSecondary">
                    PNG, JPG, or JPEG format (max 5MB)
                  </Typography>
                </Box>
                
                {logoPreview && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '200px',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {logo ? 'New Logo Preview' : 'Current Logo'}
                    </Typography>
                  </Box>
                )}
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={loading}
                    sx={{
                      color: '#2F3D57',
                      borderColor: '#2F3D57',
                      fontWeight: 600,
                      fontSize: 16,
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': {
                        borderColor: '#1a2332',
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(45deg, #2F3D57 30%, #ED7600 90%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 16,
                      px: 6,
                      py: 1.5,
                      borderRadius: 3,
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1a2332 30%, #d65c00 90%)',
                      }
                    }}
                  >
                    {loading ? 'Updating Profile...' : 'Update Profile'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

      {/* Popup Modal */}
      <PopupModal 
        isOpen={popup.isOpen}
        onClose={closePopup}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />
    </Box>
  );
};

export default SocietyProfileEdit;
