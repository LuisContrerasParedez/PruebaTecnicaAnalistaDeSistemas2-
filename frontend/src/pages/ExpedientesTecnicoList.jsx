// src/pages/ExpedientesTecnicoList.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Heading, HStack, VStack, Stack,
  Table, Thead, Tbody, Tr, Th, Td,
  Input, Select, Button, IconButton, Tag, Text,
  SimpleGrid, FormControl, FormLabel, Skeleton, Spinner,
  useColorModeValue, Card, CardBody
} from '@chakra-ui/react';
import { AddIcon, ExternalLinkIcon, SearchIcon } from '@chakra-ui/icons';
import { Link, useNavigate } from 'react-router-dom';

import { useAppSelector } from '../app/hooks';
import { selectAuth } from '../app/store';
import { api } from '../lib/api';

// --- UI: Glass ---
const Glass = (props) => {
  const bg = useColorModeValue('rgba(255,255,255,0.82)', 'rgba(255,255,255,0.06)');
  const border = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  return (
    <Card bg={bg} backdropFilter="saturate(180%) blur(14px)" border="1px solid" borderColor={border} shadow="sm" {...props} />
  );
};

// Helpers
const getExpedienteId = (r) => {
  const candidates = [r?.id, r?.CodigoExpediente, r?.codigoExpediente, r?.ExpedienteId, r?.expedienteId];
  const n = candidates.map((v) => Number(v)).find((x) => Number.isInteger(x) && x > 0);
  return n ?? null;
};
const getNoExpediente = (r) =>
  r?.no_expediente ?? r?.NoExpediente ?? r?.codigo ?? r?.Codigo ?? '';
const resolveEstado = (r) => r?.estado ?? r?.Estado ?? 'Borrador';
const fmtDate = (s) => (s ? new Date(s).toLocaleString() : '—');

export default function ExpedientesTecnicoList() {
  const navigate = useNavigate();
  const { user } = useAppSelector(selectAuth);

  // Técnico actual (ajusta según tu auth)
  const tecnicoId = useMemo(
    () => Number(user?.CodigoTecnico ?? user?.CodigoUsuario ?? user?.sub ?? user?.id ?? 0) || 0,
    [user]
  );

  // Filtros
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState(''); // '', Borrador, EnRevision, Rechazado, Aprobado
  const [desde, setDesde] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [hasta, setHasta] = useState(() => new Date().toISOString().slice(0, 10));
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Data
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar lista
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page, pageSize, tecnicoId,
        q: q || undefined,
        estado: estado || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
      };
      const { data } = await api.get('/expedientes', { params });
      setItems(data?.data ?? []);
      setTotal(data?.total ?? 0);
    } catch (e) {
      console.error('Error list expedientes:', e);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tecnicoId) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tecnicoId, q, estado, desde, hasta, page, pageSize]);

  const estadoColor = (st) => {
    const s = (st || '').toString().toLowerCase();
    if (s.includes('aprob')) return 'green';
    if (s.includes('rechaz')) return 'red';
    if (s.includes('revision')) return 'yellow';
    return 'gray';
  };

  return (
    <Box py={{ base: 4, md: 8 }}>
      <Container maxW="7xl">
        {/* Header */}
        <Glass mb={6}>
          <CardBody>
            <Stack direction={{ base: 'column', md: 'row' }} align="start" justify="space-between" gap={4}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" letterSpacing="-0.02em">Mis expedientes</Heading>
                <Text color="gray.500">Correspondientes al técnico #{tecnicoId}</Text>
              </VStack>
              <HStack>
                <Button as={Link} to="/expedientes/nuevo" colorScheme="teal" leftIcon={<AddIcon />}>
                  Nuevo expediente
                </Button>
              </HStack>
            </Stack>
          </CardBody>
        </Glass>

        {/* Filtros */}
        <Glass mb={4}>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3}>
              <FormControl>
                <FormLabel>Búsqueda</FormLabel>
                <HStack>
                  <SearchIcon opacity={0.5} />
                  <Input
                    placeholder="expediente, unidad, técnico..."
                    value={q}
                    onChange={(e) => { setPage(1); setQ(e.target.value); }}
                  />
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel>Estado</FormLabel>
                <Select value={estado} onChange={(e) => { setPage(1); setEstado(e.target.value); }}>
                  <option value="">Todos</option>
                  <option value="Borrador">Borrador</option>
                  <option value="EnRevision">En revisión</option>
                  <option value="Rechazado">Rechazado</option>
                  <option value="Aprobado">Aprobado</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Desde</FormLabel>
                <Input type="date" value={desde} onChange={(e) => { setPage(1); setDesde(e.target.value); }} />
              </FormControl>
              <FormControl>
                <FormLabel>Hasta</FormLabel>
                <Input type="date" value={hasta} onChange={(e) => { setPage(1); setHasta(e.target.value); }} />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Glass>

        {/* Tabla */}
        <Glass>
          <CardBody>
            {loading ? (
              <VStack align="stretch" spacing={2}>
                <Skeleton h="28px" /><Skeleton h="28px" /><Skeleton h="28px" />
              </VStack>
            ) : items.length ? (
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>#</Th>
                    <Th>Expediente</Th>
                    <Th>Unidad / Fiscalía</Th>
                    <Th>Registrado</Th>
                    <Th>Estado</Th>
                    <Th textAlign="right">Detalles</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items.map((r, idx) => {
                    const id = getExpedienteId(r);                 // ✅ ID NUMÉRICO
                    const no = getNoExpediente(r);                 // visible
                    const unidad = r.unidad ?? r.Unidad ?? '—';
                    const fiscalia = r.fiscalia ?? r.Fiscalia ?? '—';
                    const creado = r.creado_en ?? r.creadoEn ?? r.created_at ?? r.fecha_registro;
                    const st = resolveEstado(r);

                    return (
                      <Tr key={`${id ?? 'sinid'}-${idx}`}>
                        <Td>{id ?? '—'}</Td>
                        <Td fontWeight="600">{no || `EXP-${id ?? idx}`}</Td>
                        <Td>{unidad} / {fiscalia}</Td>
                        <Td>{fmtDate(creado)}</Td>
                        <Td><Tag colorScheme={estadoColor(st)}>{st}</Tag></Td>
                        <Td textAlign="right">
                          <IconButton
                            aria-label="Detalle"
                            size="sm"
                            icon={<ExternalLinkIcon />}
                            isDisabled={!id}
                            onClick={() =>
                              id
                                ? navigate(`/expedientes/${id}`, { state: { noExpediente: no } })
                                : null
                            }
                          />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            ) : (
              <VStack py={8} color="gray.500">
                {loading ? <Spinner /> : <Text>No hay expedientes</Text>}
              </VStack>
            )}
          </CardBody>
        </Glass>

        {/* Paginación simple */}
        {total > pageSize && (
          <HStack justify="space-between" mt={4}>
            <Text fontSize="sm" color="gray.500">
              {`Mostrando ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, total)} de ${total}`}
            </Text>
            <HStack>
              <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page <= 1}>
                Anterior
              </Button>
              <Button size="sm" onClick={() => setPage((p) => p + 1)} isDisabled={page * pageSize >= total}>
                Siguiente
              </Button>
            </HStack>
          </HStack>
        )}
      </Container>
    </Box>
  );
}
