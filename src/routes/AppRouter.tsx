import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const MainLayout = lazy(() => import('@layouts/MainLayout/MainLayout'));
const Home = lazy(() => import('@pages/Home'));
const Categories = lazy(() => import('@pages/Categories'));
const Products = lazy(() => import('@pages/Products'));
const About = lazy(() => import('@pages/About'));
const Register = lazy(() => import('@pages/Register'));
const Login = lazy(() => import('@pages/Login'));
const Error = lazy(() => import('@pages/Error'));
const Cart = lazy(() => import('@pages/Cart'));
const Wishlist = lazy(() => import('@pages/Wishlist'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>{<MainLayout />}</Suspense>
    ),
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>{<Home />}</Suspense>
        ),
      },
      {
        path: 'cart',
        element: (
          <Suspense fallback={<div>Loading...</div>}>{<Cart />}</Suspense>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <Suspense fallback={<div>Loading...</div>}>{<Wishlist />}</Suspense>
        ),
      },
      {
        path: 'categories',
        element: (
          <Suspense fallback={<div>Loading...</div>}>{<Categories />}</Suspense>
        ),
      },
      {
        path: 'categories/products/:prefix',
        element: (
          <Suspense fallback={<div>Loading...</div>}>{<Products />}</Suspense>
        ),
        loader: ({ params }) => {
          if (
            typeof params.prefix !== 'string' ||
            !/^[a-z]+$/i.test(params.prefix)
          ) {
            throw new Response('Bad Request', {
              statusText: 'Category not found',
              status: 400,
            });
          }
          return true;
        },
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<div>Loading...</div>}>{<About />}</Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<div>Loading...</div>}>{<Login />}</Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<div>Loading...</div>}>{<Register />}</Suspense>
        ),
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
