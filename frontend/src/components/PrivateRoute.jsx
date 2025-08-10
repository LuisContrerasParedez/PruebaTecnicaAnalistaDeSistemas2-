// src/components/PrivateRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import { selectAuth } from '/src/app/store';

export default function PrivateRoute({ children }) {
  const { accessToken, initialized } = useSelector(selectAuth);

  if (!initialized) {
    return (
      <Center minH="100dvh">
        <Spinner />
      </Center>
    );
  }

  if (!accessToken) return <Navigate to="/login" replace />;
  return children ?? <Outlet />;
}
