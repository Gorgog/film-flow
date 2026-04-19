import { ClearLayout } from '@/layout/ClearLayout';
import { GuestOnlyRoute } from '@/routes/GuestOnlyRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { createBrowserRouter } from 'react-router-dom';

import { BaseLayout } from '@/layout/BaseLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { HomePage } from '@/pages/home/HomePage';
import { MyListPage } from '@/pages/my-movies/MyListPage';
import { SearchMoviesPage } from '@/pages/search-movies/SearchMoviesPage';

export const router = createBrowserRouter([
  {
    element: <GuestOnlyRoute />,
    children: [
      {
        element: <ClearLayout />,
        children: [
          { path: '/register', element: <RegisterPage /> },
          { path: '/login', element: <LoginPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <BaseLayout />,
        children: [
          {
            path: '/',
            element: <HomePage />,
          },
          {
            path: '/search-movies',
            element: <SearchMoviesPage />,
          },
          {
            path: '/my-movies',
            element: <MyListPage />,
          },
        ],
      },
    ],
  },
]);
