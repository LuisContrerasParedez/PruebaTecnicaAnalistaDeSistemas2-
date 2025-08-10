// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import {
  Box, Heading, Text, VStack, HStack, Input, InputGroup, InputRightElement,
  IconButton, FormControl, FormLabel, FormErrorMessage, Button, Divider,
  useToast, useDisclosure, Card, CardBody, Link, useColorModeValue
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

import { loginThunk } from '../features/auth/authSlice';
import { selectAuth } from '../app/store';
import AuthShell from '../components/AuthShell';

export default function Login() {
  const dispatch = useDispatch();
  const toast = useToast();
  const { isOpen: showPw, onToggle } = useDisclosure();
  const { loading, error, accessToken } = useSelector(selectAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    if (error) {
      toast({
        title: 'No pudimos iniciar sesión',
        description: String(error),
        status: 'error',
        position: 'top',
        duration: 4000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  if (accessToken) return <Navigate to="/" replace />;

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(loginThunk({ email, password }));
  };

  const emailInvalid = touched.email && !/^\S+@\S+\.\S+$/.test(email);
  const pwInvalid = touched.password && password.length < 6;

  const cardShadow = useColorModeValue('subtle', 'none');

  return (
    <AuthShell>
      <Card shadow={cardShadow}>
        <CardBody p={{ base: 6, md: 10 }}>
          <VStack align="stretch" spacing={6}>
            <Box textAlign="center">
              <Heading size="lg" letterSpacing="-0.02em">Bienvenido</Heading>
              <Text mt={2} color="gray.500">
                Sistema de Gestión de Evidencias — MP Guatemala
              </Text>
            </Box>

            <form onSubmit={onSubmit}>
              <VStack align="stretch" spacing={5}>
                <FormControl isInvalid={emailInvalid}>
                  <FormLabel>Correo institucional</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    placeholder="usuario@mp.gob.gt"
                    autoFocus
                  />
                  <FormErrorMessage>Introduce un correo válido.</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={pwInvalid}>
                  <FormLabel>Contraseña</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      placeholder="••••••••"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        icon={showPw ? <ViewOffIcon /> : <ViewIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={onToggle}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>
                    La contraseña debe tener al menos 6 caracteres.
                  </FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  isLoading={loading}
                  loadingText="Ingresando…"
                  size="lg"
                >
                  Entrar
                </Button>


                <Divider />
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Uso interno. Acceso monitoreado y registrado en bitácora.
                </Text>
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>
    </AuthShell>
  );
}
