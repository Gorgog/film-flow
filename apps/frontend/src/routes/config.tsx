import { ClearLayout } from '@/layout/ClearLayout';
import { GuestOnlyRoute } from '@/routes/GuestOnlyRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { createBrowserRouter } from 'react-router-dom';

import { BaseLayout } from '@/layout/BaseLayout';
import { RegisterPage } from '@/pages/auth/RegisterPage';
export const router = createBrowserRouter([
  {
    element: <GuestOnlyRoute />,
    children: [
      {
        element: <ClearLayout />,
        children: [
          { path: '/register', element: <RegisterPage /> },
          { path: '/login', element: <div>Login</div> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <BaseLayout />,
        children: [{ path: '/', element: <div>Home</div> }],
      },
    ],
  },
]);
