// src/Bootstrap.jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initFromStorage, refreshTokenThunk } from '/src/features/auth/authSlice';

export default function Bootstrap({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(initFromStorage());
    dispatch(refreshTokenThunk()).catch(() => {});
  }, [dispatch]);
  return children;
}
