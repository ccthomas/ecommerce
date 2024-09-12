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
        items={[
          {
            label: 'Products',
            route: routeConfigs.products.path,
          },
        ]}
      />
      <Container>
        <Box>
          <Typography variant="h2" gutterBottom>
            Basic Welcome Page for navigating to parts of the PoC.
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
