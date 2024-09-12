import React from 'react';
import {
  Container, Typography, Button, Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import routeConfigs from '../RoutesConfig';
import DynamicAppBar from '../components/DynamicAppBar';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <DynamicAppBar
        title='E-Commerce'
        items={[
          {
            label: 'Products',
            route: routeConfigs.products.path,
          },
        ]}
      />
      <Container>
        {/* Hero Section */}
        <Box>
          <Typography variant="h2" gutterBottom>
            Placeholder
          </Typography>
          <Button variant="contained" color="primary" onClick={() => { navigate(routeConfigs.products.path); }}>
            Products Page
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;
