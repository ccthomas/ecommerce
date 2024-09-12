import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import ProductEditPage from './pages/ProductEditPage';
import ProductPage from './pages/ProductPage';

export type RouteConfig = {
  path: string;
  element: JSX.Element;
  isPrivate?: boolean;
};

const routeConfigs: Record<string, RouteConfig> = {
  // Home
  home: {
    path: '/',
    element: <HomePage />,
  },
  // Products
  products: {
    path: '/products',
    element: <ProductPage />,
  },
  productsEdit: {
    path: '/products/edit',
    element: <ProductEditPage />,
  },
  inventory: {
    path: '/products/inventory/:productId',
    element: <InventoryPage />,
  },
};

export default routeConfigs;
