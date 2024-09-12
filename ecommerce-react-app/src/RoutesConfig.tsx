import HomePage from './pages/HomePage';
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
};

export default routeConfigs;
