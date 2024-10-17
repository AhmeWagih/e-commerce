import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
const MainLayout = lazy(() => import('@layouts/MainLayout/MainLayout'));
const Home = lazy(() => import('@pages/Home'));
const Categories = lazy(() => import('@pages/Categories'));
const Products = lazy(() => import('@pages/Products'));
const About = lazy(() => import('@pages/About'));
const Profile = lazy(() => import('@pages/Profile'));
const Register = lazy(() => import('@pages/Register'));
const Login = lazy(() => import('@pages/Login'));
const Cart = lazy(() => import('@pages/Cart'));
const Wishlist = lazy(() => import('@pages/Wishlist'));
import Error from '@pages/Error';
import SuspenseFallback from '@components/feedback/suspenseFallback/SuspenseFallback';
import LottieHandler from '@components/feedback/lottieHandler/LottieHandler';
import ProtectedRout from '@components/auth/ProtectedRout';
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
        element: (
          <ProtectedRout>
            <SuspenseFallback>{<Cart />}</SuspenseFallback>
          </ProtectedRout>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <ProtectedRout>
            <SuspenseFallback>{<Wishlist />}</SuspenseFallback>
          </ProtectedRout>
        ),
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
      {
        path: 'profile',
        element: (
          <ProtectedRout>
            <SuspenseFallback>{<Profile />}</SuspenseFallback>
          </ProtectedRout>
        ),
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
