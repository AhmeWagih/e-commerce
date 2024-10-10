import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
const MainLayout = lazy(() => import('@layouts/MainLayout/MainLayout'));
const Home = lazy(() => import('@pages/Home'));
const Categories = lazy(() => import('@pages/Categories'));
const Products = lazy(() => import('@pages/Products'));
const About = lazy(() => import('@pages/About'));
const Register = lazy(() => import('@pages/Register'));
const Login = lazy(() => import('@pages/Login'));
const Cart = lazy(() => import('@pages/Cart'));
const Wishlist = lazy(() => import('@pages/Wishlist'));
import Error from '@pages/Error';
import SuspenseFallback from '@components/feedback/suspenseFallback/SuspenseFallback';
import LottieHandler from '@components/feedback/lottieHandler/LottieHandler';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense
        fallback={
          <div style={{ marginTop: '10%' }}>
            <LottieHandler type="loading" message="Loading please wait..." />
          </div>
        }
      >
        <MainLayout />
      </Suspense>
    ),
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: (
          <SuspenseFallback>
            <Home />
          </SuspenseFallback>
        ),
      },
      {
        path: 'cart',
        element: <SuspenseFallback>{<Cart />}</SuspenseFallback>,
      },
      {
        path: 'wishlist',
        element: <SuspenseFallback>{<Wishlist />}</SuspenseFallback>,
      },
      {
        path: 'categories',
        element: <SuspenseFallback>{<Categories />}</SuspenseFallback>,
      },
      {
        path: 'categories/products/:prefix',
        element: <SuspenseFallback>{<Products />}</SuspenseFallback>,
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
        element: <SuspenseFallback>{<About />}</SuspenseFallback>,
      },
      {
        path: 'login',
        element: <SuspenseFallback>{<Login />}</SuspenseFallback>,
      },
      {
        path: 'register',
        element: <SuspenseFallback>{<Register />}</SuspenseFallback>,
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
