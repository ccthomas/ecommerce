import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import routeConfigs from '../RoutesConfig';
import DynamicAppBar from '../components/DynamicAppBar';
import { useProductContext } from '../contexts/ProductContext';
import { Product } from '../types/Product';
import { useInventoryContext } from '../contexts/InventoryContext';
import DialogComingSoon from '../components/DialogComingSoon';

/**
 * This page is a quick hack job to get inventory feature out.
 */
const InventoryPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { products } = useProductContext();
  const {
    inventory, loading, error, fetchInventoryByProductId, saveInventory,
  } = useInventoryContext();

  // We are going to assume for PoC that Product exists.
  // Error handling will be ignored.
  const product: Product | undefined = products.find((p: Product) => p.id === productId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ price: '', quantity: '' });
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  useEffect(() => {
    fetchInventoryByProductId(productId!);
  }, [productId]);

  const handleEditProduct = () => {
    navigate(`${routeConfigs.productsEdit.path}?id=${productId}`);
  };

  const handleAddItem = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewItem({ price: '', quantity: '' });
  };

  const handleDeleteeCloseDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleSaveItem = () => {
    if (newItem.price && newItem.quantity) {
      saveInventory({
        productId: productId!,
        price: parseFloat(newItem.price),
        quantity: parseInt(newItem.quantity, 10),
      });
      setAlertMessage('Inventory item added successfully');
      setAlertOpen(true);
      handleCloseDialog();
    } else {
      setAlertMessage('Please fill in all fields');
      setAlertOpen(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

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
          <Paper elevation={3} sx={{ padding: 2, mb: 4 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h4" gutterBottom>
                {product!.name}
                <IconButton onClick={handleEditProduct} color="primary" aria-label="edit">
                  <EditIcon />
                </IconButton>
              </Typography>

              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
              >
                Add Inventory Item
              </Button>
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ padding: 2, height: 'calc(100vh - 300px)', overflow: 'auto' }}>
            {/* Loading State */}
            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            )}

            {/* Error State */}
            {error && (
              <Box my={2}>
                <Alert severity="error">{error || 'An error occurred while fetching inventory.'}</Alert>
              </Box>
            )}
            {!loading && !error && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Price</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.price}
                            disabled
                            variant="outlined"
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            disabled
                            value={item.quantity}
                            variant="outlined"
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={handleDeleteClick} color="secondary">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
          <Dialog open={dialogOpen} onClose={handleCloseDialog}>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                name="price"
                label="Price"
                type="number"
                fullWidth
                variant="standard"
                value={newItem.price}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                name="quantity"
                label="Quantity"
                type="number"
                fullWidth
                variant="standard"
                value={newItem.quantity}
                onChange={handleChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSaveItem} color="primary" startIcon={<SaveIcon />}>
                Save
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={alertOpen}
            autoHideDuration={6000}
            onClose={() => setAlertOpen(false)}
          >
            <Alert onClose={() => setAlertOpen(false)} severity="success">
              {alertMessage}
            </Alert>
          </Snackbar>
          <DialogComingSoon
            isOpen={openDeleteDialog}
            onClose={handleDeleteeCloseDialog}
          />
        </Box>
      </Container>
    </>
  );
};

export default InventoryPage;
