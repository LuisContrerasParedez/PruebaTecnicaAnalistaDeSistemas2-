import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Input, InputGroup, InputLeftElement, HStack, Button, Badge,
  Spinner, Alert, AlertIcon, IconButton, useDisclosure, Text,
  Select, useColorModeValue
} from '@chakra-ui/react';
import { SearchIcon, EditIcon, RepeatIcon, ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectUsuarios } from '../../app/store';
import {
  fetchUsuarios, createUsuario, updateUsuario,
  setUsuarioActivo, setUsuarioPassword
} from '../../features/usuarios/usuariosSlice';
import UsuarioFormModal from './components/UsuarioFormModal.jsx';
import ResetPasswordModal from './components/ResetPasswordModal.jsx';

export default function UsuariosPage() {
  const dispatch = useAppDispatch();
  const { items = [], loading, error, page = 1, pageSize = 20, total = 0 } = useAppSelector(selectUsuarios);

  // ── Filtros locales
  const [q, setQ] = useState('');
  const [activo, setActivo] = useState(''); // '', '1', '0'

  // ── Modales
  const formDisc = useDisclosure();
  const passDisc = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [targetUser, setTargetUser] = useState(null);

  // ── Carga inicial
  useEffect(() => {
    dispatch(fetchUsuarios({ q: '', page: 1, pageSize: 20 }));
  }, [dispatch]);

  const onSearch = (e) => {
    e?.preventDefault?.();
    const filters = { q, page: 1, pageSize: 20 };
    if (activo !== '') filters.activo = activo === '1';
    dispatch(fetchUsuarios(filters));
  };

  const onClear = () => {
    setQ('');
    setActivo('');
    dispatch(fetchUsuarios({ q: '', page: 1, pageSize: 20 }));
  };

  const onNew = () => { setEditing(null); formDisc.onOpen(); };
  const onEdit = (u) => { setEditing(u); formDisc.onOpen(); };

  const onToggleActivo = (u) => {
    dispatch(setUsuarioActivo({ id: u.CodigoUsuario, activo: !u.activo }))
      .unwrap()
      .then(() => dispatch(fetchUsuarios({ q, page: 1, pageSize: 20 })))
      .catch(() => {});
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / (pageSize || 20))),
    [total, pageSize]
  );

  // ── Colores sensibles al modo
  const cardBg     = useColorModeValue('white', 'gray.800');
  const headBg     = useColorModeValue('gray.50', 'whiteAlpha.100');
  const hoverBg    = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const borderCol  = useColorModeValue('gray.200', 'whiteAlpha.200');
  const subtleText = useColorModeValue('gray.600', 'gray.300');

  // ── Helpers para render seguro
  const rolText = (u) =>
    u.rol_nombre ?? (typeof u.rol === 'string' ? u.rol : u.rol?.nombre) ?? '—';

  const safeText = (v) =>
    v == null ? '—' : typeof v === 'object' ? (v.nombre ?? v.name ?? String(v.id ?? '—')) : String(v);

  return (
    <Box>
      <HStack justify="space-between" mb={4} wrap="wrap" gap={3}>
        <Heading size="md">Usuarios</Heading>

        <HStack as="form" onSubmit={onSearch} gap={2} wrap="wrap">
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={subtleText} />
            </InputLeftElement>
            <Input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Buscar nombre/correo"
              width="260px"
              variant="filled"
            />
          </InputGroup>

          <Select
            size="sm"
            value={activo}
            onChange={(e)=>setActivo(e.target.value)}
            width="160px"
            variant="filled"
          >
            <option value="">Todos</option>
            <option value="1">Activos</option>
            <option value="0">Inactivos</option>
          </Select>

          <HStack>
            <Button size="sm" colorScheme="blue" onClick={onSearch}>Buscar</Button>
            <Button size="sm" variant="ghost" onClick={onClear}>Limpiar</Button>
            <Button size="sm" colorScheme="blue" onClick={onNew}>Nuevo</Button>
          </HStack>
        </HStack>
      </HStack>

      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {String(error)}
        </Alert>
      )}

      {/* Contenedor con scroll horizontal en pantallas estrechas */}
      <Box
        borderWidth="1px"
        borderRadius="lg"
        overflowX="auto"
        bg={cardBg}
        borderColor={borderCol}
        shadow="sm"
      >
        <Table size="sm" sx={{
          'tbody tr:nth-of-type(even)': { bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.50') },
        }}>
          <Thead position="sticky" top={0} zIndex={1} bg={headBg} borderBottomWidth="1px" borderColor={borderCol}>
            <Tr>
              <Th>ID</Th>
              <Th>Nombre</Th>
              <Th>Correo</Th>
              <Th>Rol</Th>
              <Th>Activo</Th>
              <Th isNumeric>Acciones</Th>
            </Tr>
          </Thead>

          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={6}>
                  <HStack py={8} justify="center"><Spinner /></HStack>
                </Td>
              </Tr>
            ) : items.length ? (
              items.map((u) => (
                <Tr key={u.CodigoUsuario ?? u.id ?? u.correo} _hover={{ bg: hoverBg }}>
                  <Td>{safeText(u.CodigoUsuario)}</Td>
                  <Td>{safeText(u.nombre)}</Td>
                  <Td>{safeText(u.correo)}</Td>
                  <Td><Badge variant="subtle">{rolText(u)}</Badge></Td>
                  <Td>
                    <Badge colorScheme={u.activo ? 'green' : 'red'} variant="subtle">
                      {u.activo ? 'Sí' : 'No'}
                    </Badge>
                  </Td>
                  <Td isNumeric>
                    <HStack justify="flex-end" spacing={1}>
                      <Button size="xs" colorScheme="blue" onClick={()=>onEdit(u)} leftIcon={<EditIcon />}>
                        Editar
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="blue"
                        onClick={()=>onToggleActivo(u)}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </Button>
                      <IconButton
                        size="xs"
                        aria-label="Resetear contraseña"
                        title="Resetear contraseña"
                        icon={<RepeatIcon />}
                        variant="ghost"
                        onClick={()=>{ setTargetUser(u); passDisc.onOpen(); }}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} py={10} textAlign="center" color={subtleText}>
                  Sin resultados
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Paginación */}
      <HStack mt={4} justify="space-between" wrap="wrap" gap={3}>
        <Text fontSize="sm" color={subtleText}>
          {total} registro(s) · Página {page} de {totalPages}
        </Text>
        <HStack>
          <Button
            size="sm"
            leftIcon={<ArrowBackIcon />}
            isDisabled={page <= 1}
            onClick={() => dispatch(fetchUsuarios({ q, page: page - 1, pageSize }))}
            variant="outline"
            colorScheme="blue"
          >
            Anterior
          </Button>
          <Button
            size="sm"
            rightIcon={<ArrowForwardIcon />}
            isDisabled={page >= totalPages}
            onClick={() => dispatch(fetchUsuarios({ q, page: page + 1, pageSize }))}
            colorScheme="blue"
          >
            Siguiente
          </Button>
        </HStack>
      </HStack>

      {/* Modales */}
      <UsuarioFormModal
        isOpen={formDisc.isOpen}
        onClose={formDisc.onClose}
        initial={editing}
        onSubmit={async (payload)=>{
          if (editing) await dispatch(updateUsuario({ id: editing.CodigoUsuario, payload })).unwrap();
          else         await dispatch(createUsuario(payload)).unwrap();
          formDisc.onClose();
          onSearch();
        }}
      />

      <ResetPasswordModal
        isOpen={passDisc.isOpen}
        onClose={passDisc.onClose}
        usuario={targetUser}
        onSubmit={async (password)=>{
          await dispatch(setUsuarioPassword({ id: targetUser.CodigoUsuario, password })).unwrap();
          passDisc.onClose();
        }}
      />
    </Box>
  );
}
