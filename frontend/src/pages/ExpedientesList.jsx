import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Heading, HStack, Input, Select, Button, Table, Thead, Tr, Th, Tbody, Td,
  Badge, Spinner, Text, Stack, useToast
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchExpedientes, setFilters } from '../features/expedientes/expedientesSlice';

const EstadoBadge = ({ value }) => {
  const map = {
    Borrador: { colorScheme: 'gray' },
    'EnRevision': { colorScheme: 'blue', label: 'En revisión' },
    Rechazado: { colorScheme: 'red' },
    Aprobado: { colorScheme: 'green' },
  };
  const m = map[value] || { colorScheme: 'gray' };
  const label = m.label || value;
  return <Badge rounded="md" colorScheme={m.colorScheme}>{label}</Badge>;
};

export default function ExpedientesList() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const toast = useToast();

  useEffect(() => { dispatch(fetchExpedientes(filters)); }, [dispatch]);

  useEffect(() => {
    if (error) toast({ title: 'Error', description: error, status: 'error', position: 'top' });
  }, [error, toast]);

  const reload = () => dispatch(fetchExpedientes({ ...filters, page: 1 }));

  return (
    <Box p={{ base: 4, md: 8 }}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg" letterSpacing="-0.02em">Expedientes</Heading>
        <Button onClick={() => nav('/expedientes/nuevo')}>Nuevo expediente</Button>
      </HStack>

      <Stack direction={{ base: 'column', md: 'row' }} spacing={3} mb={4}>
        <Input
          placeholder="Buscar por número, unidad, descripción…"
          value={filters.q || ''}
          onChange={(e) => dispatch(setFilters({ q: e.target.value }))}
          onKeyDown={(e) => e.key === 'Enter' && reload()}
        />
        <Select
          value={filters.estado || ''}
          onChange={(e) => dispatch(setFilters({ estado: e.target.value }))}
        >
          <option value="">Todos los estados</option>
          <option value="Borrador">Borrador</option>
          <option value="EnRevision">En revisión</option>
          <option value="Rechazado">Rechazado</option>
          <option value="Aprobado">Aprobado</option>
        </Select>
        <Button variant="glass" onClick={reload}>Buscar</Button>
      </Stack>

      <Box borderWidth="1px" rounded="2xl" overflow="hidden">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>No. expediente</Th>
              <Th>Unidad</Th>
              <Th>Fiscalía</Th>
              <Th>Estado</Th>
              <Th>Creado</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading && (
              <Tr><Td colSpan={6}><HStack py={6} justify="center"><Spinner /><Text>Cargando…</Text></HStack></Td></Tr>
            )}
            {!loading && items.map((e) => (
              <Tr key={e.CodigoExpediente}>
                <Td>
                  <Link to={`/expedientes/${e.CodigoExpediente}`}>
                    <Text fontWeight="semibold">{e.no_expediente}</Text>
                  </Link>
                </Td>
                <Td>{e.unidad || '-'}</Td>
                <Td>{e.fiscalia || '-'}</Td>
                <Td><EstadoBadge value={e.estado} /></Td>
                <Td>{new Date(e.creado_en).toLocaleString()}</Td>
                <Td textAlign="right">
                  <Button size="sm" variant="glass" as={Link} to={`/expedientes/${e.CodigoExpediente}`}>Abrir</Button>
                </Td>
              </Tr>
            ))}
            {!loading && items.length === 0 && (
              <Tr><Td colSpan={6}><Box p={6} textAlign="center" color="gray.500">Sin resultados</Box></Td></Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Text mt={3} color="gray.500" fontSize="sm">Total: {total} • Página {page} de {Math.max(1, Math.ceil(total / pageSize))}</Text>
    </Box>
  );
}
