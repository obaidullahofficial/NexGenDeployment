import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Button, Paper, Alert, Avatar, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getSocietyProfile } from '../../services/apiService';

const SocietyProfile = () => {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
      const result = await getSocietyProfile();
      
      if (result.success && result.profile) {
        setProfile(result.profile);
      } else if (result.error && result.error.includes('Profile not found')) {
        setMessage('No profile found. Please set up your profile first.');
      } else {
        setMessage(result.error || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      if (error.message.includes('Authentication')) {
        setMessage('Session expired. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage('Error loading profile: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate('/society-profile-setup');
  };

  const handleSetupProfile = () => {
    navigate('/society-profile-setup');
  };

  const isProfileComplete = () => {
    if (!profile) return false;
    const requiredFields = ['name', 'description', 'location', 'available_plots', 'price_range'];
    const hasAllFields = requiredFields.every(field => profile[field]);
    const hasLogo = profile.society_logo;
    return hasAllFields && hasLogo;
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography variant="h6" color="textSecondary">Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, minHeight: '100vh', background: '#f8f9fa' }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        
        {message && <Alert severity="info" sx={{ mb: 3 }}>{message}</Alert>}

        {profile ? (
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ color: '#2F3D57', fontWeight: 700 }}>
                  Society Profile
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleEditProfile}
                  sx={{
                    borderColor: '#ED7600',
                    color: '#ED7600',
                    '&:hover': {
                      borderColor: '#d65c00',
                      backgroundColor: 'rgba(237, 118, 0, 0.1)'
                    }
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
              
              <Grid container spacing={4}>
                {/* Logo Section */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#2F3D57', fontWeight: 600, mb: 2 }}>
                      Society Logo
                    </Typography>
                    {profile.society_logo ? (
                      <Avatar
                        src={profile.society_logo}
                        alt="Society Logo"
                        sx={{ 
                          width: 150, 
                          height: 150, 
                          mx: 'auto',
                          mb: 2,
                          border: '3px solid #ED7600',
                          boxShadow: '0 4px 12px rgba(237, 118, 0, 0.3)'
                        }}
                      />
                    ) : (
                      <Avatar
                        sx={{ 
                          width: 150, 
                          height: 150, 
                          mx: 'auto',
                          mb: 2,
                          bgcolor: '#f5f5f5',
                          color: '#666',
                          fontSize: '48px',
                          border: '2px dashed #ddd'
                        }}
                      >
                        🏢
                      </Avatar>
                    )}
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ 
                        color: isProfileComplete() ? '#4caf50' : '#ff9800',
                        fontWeight: 600
                      }}>
                        {isProfileComplete() ? '✅ Complete' : '⚠️ Incomplete'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {/* Profile Details */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ color: '#2F3D57', fontWeight: 600, mb: 1 }}>
                        Society Name
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', fontSize: '18px', mb: 2 }}>
                        {profile.name || 'Not specified'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ color: '#2F3D57', fontWeight: 600, mb: 1 }}>
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', fontSize: '16px' }}>
                        📍 {profile.location || 'Not specified'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ color: '#2F3D57', fontWeight: 600, mb: 1 }}>
                        Available Plots
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', fontSize: '16px' }}>
                        {profile.available_plots || 'Not specified'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ color: '#2F3D57', fontWeight: 600, mb: 1 }}>
                        Price Range
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', fontSize: '16px' }}>
                        💰 {profile.price_range || 'Not specified'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ color: '#2F3D57', fontWeight: 600, mb: 1 }}>
                        Description
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', fontSize: '16px', lineHeight: 1.6 }}>
                        {profile.description || 'No description provided'}
                      </Typography>
                    </Grid>
                    
                    {profile.updated_at && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="textSecondary">
                          Last updated: {new Date(profile.updated_at).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              
              {!isProfileComplete() && (
                <Alert severity="warning" sx={{ mt: 4 }}>
                  Your profile is incomplete. Please update all required fields and upload a logo to access all features.
                </Alert>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card elevation={3}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: '#2F3D57', fontWeight: 600, mb: 2 }}>
                No Profile Found
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Set up your society profile to get started with managing your properties.
              </Typography>
              <Button
                variant="contained"
                onClick={handleSetupProfile}
                sx={{
                  background: 'linear-gradient(45deg, #2F3D57 30%, #ED7600 90%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1a2332 30%, #d65c00 90%)',
                  }
                }}
              >
                Set Up Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default SocietyProfile;
