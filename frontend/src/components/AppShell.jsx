import {
  Box, Flex, HStack, IconButton, Avatar, Menu, MenuButton, MenuList, MenuItem,
  useColorMode, useColorModeValue, Text, Spacer, InputGroup, InputLeftElement, Input
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, SearchIcon } from '@chakra-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '/src/features/auth/authSlice';
import { selectAuth } from '/src/app/store';
import { Link } from 'react-router-dom';

export default function AppShell({ children }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('#fbfbfd', '#0b0b0d');
  const bar = useColorModeValue('rgba(255,255,255,0.75)', 'rgba(255,255,255,0.06)');
  const border = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');

  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);

  return (
    <Box minH="100dvh" bg={bg}>
      {/* Topbar “glass” */}
      <Flex
        as="header"
        position="sticky"
        top={0}
        zIndex={10}
        px={{ base: 4, md: 8 }}
        py={3}
        bg={bar}
        backdropFilter="saturate(180%) blur(14px)"
        borderBottom="1px solid"
        borderColor={border}
        align="center"
        gap={3}
      >
        <Text as={Link} to="/" fontWeight="700" letterSpacing="-0.02em">
          DICRI
        </Text>

        <InputGroup maxW="520px" display={{ base: 'none', md: 'block' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input placeholder="Buscar (expediente, unidad, técnico…)" variant="filled" />
        </InputGroup>

        <Spacer />

        <HStack spacing={2}>
          <IconButton
            aria-label="Cambiar tema"
            size="sm"
            variant="ghost"
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          />
          <Menu>
            <MenuButton>
              <Avatar size="sm" name={user?.nombre} />
            </MenuButton>
            <MenuList>
              <MenuItem as={Link} to="/perfil">Mi perfil</MenuItem>
              <MenuItem onClick={() => dispatch(logoutThunk())}>Cerrar sesión</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Contenido */}
      <Box as="main" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
        {children}
      </Box>
    </Box>
  );
}
