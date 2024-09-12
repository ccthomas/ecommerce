import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Container,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../contexts/ProductContext';
import ProductCard from '../components/ProductCard';
import DynamicAppBar from '../components/DynamicAppBar';
import routeConfigs from '../RoutesConfig';

/**
 * Flaw with page.
 *
 * Every character typed in the search bar reloads the page.
 * Instead of handling each change in the text field, we should
 * use a form that grabs the value of the text field on submit.
 */

// Define the type for the pagination state
interface PaginationState {
  page: number;
  rowsPerPage: number;
}

const ProductTable: React.FC = () => {
  const navigate = useNavigate();
  const {
    products,
    fetchProducts,
    loading,
    error,
    loadMoreProducts,
  } = useProductContext();
  const [permissions] = useState<string[]>(['product::edit', 'product::delete']); // Remove permissions for testing
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, rowsPerPage: 10 });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'name' | 'updated_at'>('name');
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  useEffect(() => {
    setPagination({ page: 1, rowsPerPage: 10 });
    fetchProducts({
      page: 1,
      pageSize: 10,
      name: searchQuery === '' ? undefined : searchQuery,
      sort: sortOrder,
      sortBy,
    });
  }, [searchQuery, sortOrder, sortBy]);

  useEffect(() => {
    loadMoreProducts({
      page: pagination.page,
      pageSize: pagination.rowsPerPage,
      name: searchQuery === '' ? undefined : searchQuery,
      sort: sortOrder,
      sortBy,
    });
  }, [pagination.page, pagination.rowsPerPage]);

  let canEdit = false;
  let canDelete = false;
  permissions.forEach((permission: string) => {
    if (permission === 'product::edit') {
      canEdit = true;
    } else if (permission === 'product::delete') {
      canDelete = true;
    }
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortOrder(event.target.value as 'asc' | 'desc');
  };

  const handleSortByChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value as 'name' | 'updated_at');
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleLoadMore = () => {
    setPagination({
      ...pagination,
      page: pagination.page + 1,
    });
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
          {/* Search and Sorting Paper */}
          <Paper elevation={3} sx={{ padding: 2, mb: 4 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              {/* Create New Product Button */}
              <Button
                variant="contained"
                color="primary"
                sx={{
                  height: '56px',
                  minWidth: '150px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
                  },
                }}
                onClick={() => { navigate(routeConfigs.productsEdit.path); }}
              >
                Create New Product
              </Button>

              {/* Search TextField */}
              <TextField
                label="Search"
                variant="outlined"
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  ml: 2,
                  mr: 2,
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              {/* Sort By FormControl */}
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id="sort-by-select-label">Sort By</InputLabel>
                <Select
                  labelId="sort-by-select-label"
                  id="sort-by-select"
                  value={sortBy}
                  onChange={handleSortByChange}
                  label="Sort By"
                  sx={{
                    borderRadius: '8px',
                    '& .MuiSelect-select': {
                      paddingY: '16px', // Adjust padding for better alignment
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="updated_at">Updated</MenuItem>
                </Select>
              </FormControl>

              {/* Sort Direction FormControl */}
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id="sort-select-label">Direction</InputLabel>
                <Select
                  labelId="sort-select-label"
                  id="sort-select"
                  value={sortOrder}
                  onChange={handleSortChange}
                  label="Sort Direction"
                  sx={{
                    borderRadius: '8px',
                    '& .MuiSelect-select': {
                      paddingY: '16px', // Adjust padding for better alignment
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Products Paper */}
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
                <Alert severity="error">{error || 'An error occurred while fetching products.'}</Alert>
              </Box>
            )}

            {/* Products Grid */}
            {!loading && !error && (
              <Grid container spacing={4}>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    <Grid item xs={12} sm={4} md={3} key={index}>
                      <ProductCard
                        id={product.id}
                        title={product.name}
                        imageUrl={product.imageUrl}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onDeleteClick={handleDeleteClick} // Pass the click handler
                        priceLowest={product.priceLowest}
                      />
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12} sm={12} md={12} key={0}>
                    <Typography variant="body1" align="center">
                      No products found.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}

            {/* Load More Button */}
            <Box display="flex" justifyContent="center" my={2}>
              <Button variant="contained" color="primary" onClick={handleLoadMore}>
                Load More
              </Button>
            </Box>
          </Paper>

          {/* Delete Confirmation Dialog */}
          {/* selected id is not being tracked at this time,
          so we cannot delete the selected prodouct. */}
          <Dialog
            open={openDeleteDialog}
            onClose={handleCloseDialog}
          >
            <DialogTitle>Delete Feature</DialogTitle>
            <DialogContent>
              <Typography>
                Delete Feature Coming Soon...
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </>
  );
};

export default ProductTable;
