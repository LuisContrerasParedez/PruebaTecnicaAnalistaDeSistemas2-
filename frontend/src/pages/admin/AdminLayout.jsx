import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Box, Container, Heading, HStack, Tabs, TabList, Tab,
  useColorModeValue
} from '@chakra-ui/react';

const tabs = [
  { to: '/admin/usuarios', label: 'Usuarios' },
  { to: '/admin/roles',    label: 'Roles' },
];

export default function AdminLayout() {
  const { pathname } = useLocation();

  // calcula el índice activo según la ruta actual
  const activeIndex = (() => {
    const i = tabs.findIndex(t => pathname.startsWith(t.to));
    return i === -1 ? 0 : i;
  })();

  // colores sensibles al modo
  const tabColor         = useColorModeValue('gray.700', 'gray.200');
  const tabHoverBg       = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const tabSelectedBg    = useColorModeValue('gray.100', 'whiteAlpha.200');
  const tabSelectedColor = useColorModeValue('gray.900', 'white');
  const borderColor      = useColorModeValue('gray.200', 'whiteAlpha.300');

  return (
    <Container maxW="7xl" py={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Administración</Heading>
      </HStack>

      <Tabs index={activeIndex} variant="enclosed" colorScheme="gray">
        <TabList>
          {tabs.map(t => (
            <Tab
              key={t.to}
              as={NavLink}
              to={t.to}
              end
              color={tabColor}
              _hover={{ bg: tabHoverBg }}
              _selected={{ bg: tabSelectedBg, color: tabSelectedColor, borderColor }}
              _focusVisible={{ boxShadow: 'outline' }}
            >
              {t.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>

      <Box mt={6}>
        <Outlet />
      </Box>
    </Container>
  );
}
