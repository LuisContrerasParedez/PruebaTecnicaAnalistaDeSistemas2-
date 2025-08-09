import { Flex, Button, Spacer, useColorMode, IconButton } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logoutThunk } from '../features/auth/thunks';

export default function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  return (
    <Flex p="4" bg="teal.500" color="white" align="center">
      <strong>Mi App</strong>
      <Spacer />
      <IconButton
        aria-label="Toggle theme"
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        mr={2}
      />
      {user && (
        <Button colorScheme="pink" onClick={() => dispatch(logoutThunk())}>
          Logout
        </Button>
      )}
    </Flex>
  );
}
