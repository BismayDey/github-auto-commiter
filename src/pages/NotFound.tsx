import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="70vh"
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          textAlign: 'center',
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: '4rem' }}>
          404
        </Typography>
        <Typography variant="h5" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/"
          startIcon={<Home size={20} />}
        >
          Back to Home
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;