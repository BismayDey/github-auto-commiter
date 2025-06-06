import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pt: 4, 
          pb: 4,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;