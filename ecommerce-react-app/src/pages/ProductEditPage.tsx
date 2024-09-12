import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Container,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useProductContext } from '../contexts/ProductContext';
import DynamicAppBar from '../components/DynamicAppBar';
import routeConfigs from '../RoutesConfig';

/**
 * Flaw with page.
 *
 * Every character typed in the search bar reloads the page.
 * Instead of handling each change in the text field, we should
 * use a form that grabs the value of the text field on submit.
 */

const ProductForm = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams(); // Use for editing an existing product
  const id = params.get('id');

  const {
    product,
    fetchProductById,
    saveProduct,
    uploadProductImage,
    loading,
    error,
  } = useProductContext();

  const [name, setName] = useState<string>(product?.name || '');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl] = useState<string | null>(product?.imageUrl || null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id]);

  useEffect(() => {
    setName(product?.name || '');
  }, [product]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async () => {
    let objectKey: string | null = product?.imageObjectKey || null;
    if (image !== null) {
      objectKey = await uploadProductImage(image);
      if (objectKey === null) {
        return;
      }
    }

    const isSuccess = await saveProduct({
      ...product,
      imageUrl: undefined,
      imageObjectKey: objectKey,
      name,
    });

    if (isSuccess) {
      setShowSnackbar(true);
      navigate('/products');
    } else {
      setShowSnackbar(false);
    }
  };

  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };

  let previewImage = image !== null ? URL.createObjectURL(image) : '';
  if (previewImage === '' && imageUrl !== null) {
    previewImage = imageUrl;
  }

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
        <Box my={4}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
              {id ? 'Edit Product' : 'Create Product'}
            </Typography>

            {loading && <CircularProgress />}
            {error && (
              <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="error">
                  {error}
                </Alert>
              </Snackbar>
            )}

            {!loading && (
              <Box component="form" noValidate autoComplete="off" mt={2}>
                <TextField
                  fullWidth
                  label="Product Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="upload-image"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="upload-image">
                  <Button
                    variant="outlined"
                    color="primary"
                    component="span"
                    startIcon={<PhotoCameraIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Image
                  </Button>
                </label>

                {previewImage && (
                  <Box
                    component="img"
                    src={previewImage}
                    alt="Product Preview"
                    sx={{
                      width: 200, height: 200, objectFit: 'cover', mb: 2,
                    }}
                  />
                )}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {id ? 'Update Product' : 'Create Product'}
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default ProductForm;
