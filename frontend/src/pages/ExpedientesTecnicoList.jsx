// src/pages/ExpedientesTecnicoList.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Heading, HStack, VStack, Stack,
  Table, Thead, Tbody, Tr, Th, Td,
  Input, Select, Button, IconButton, Tag, Text, Tooltip,
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
const getTecnicoIdFromRow = (r) =>
  Number(r?.CodigoTecnico ?? r?.tecnicoId ?? r?.TecnicoId ?? r?.codigoTecnico ?? 0) || 0;

const getNoExpediente = (r) =>
  r?.no_expediente ?? r?.NoExpediente ?? r?.codigo ?? r?.Codigo ?? '';
const resolveEstado = (r) => r?.estado ?? r?.Estado ?? 'Borrador';
const fmtDate = (s) => (s ? new Date(s).toLocaleString() : '—');

const dedupeById = (arr) => {
  const m = new Map();
  for (const r of arr) {
    const id = getExpedienteId(r);
    if (id != null) m.set(id, r);
  }
  return Array.from(m.values());
};

export default function ExpedientesTecnicoList() {
  const navigate = useNavigate();
  const { user } = useAppSelector(selectAuth);

  // roles
  const rolName = (user?.rol || user?.rol_nombre || '').toString().toLowerCase();
  const isAdmin = rolName.includes('admin') || user?.CodigoRol === 1;
  const isCoordinator = rolName.includes('coordinador') || user?.CodigoRol === 2;
  const isReviewer = isAdmin || isCoordinator;

  // Técnico actual
  const tecnicoId = useMemo(
    () => Number(user?.CodigoTecnico ?? user?.CodigoUsuario ?? user?.sub ?? user?.id ?? 0) || 0,
    [user]
  );

  // Filtros
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
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

      const base = {
        page, pageSize,
        q: q || undefined,
        estado: estado || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
      };

      // 1) siempre: los propios del técnico logueado
      const ownParams = { ...base, tecnicoId };
      const own = await api.get('/expedientes', { params: ownParams });
      let combined = own?.data?.data ?? [];

      // 2) si es admin/coordinador: agregar TODOS EnRevision (sin tecnicoId)
      if (isReviewer) {
        const reviewParams = { ...base, tecnicoId: undefined, estado: 'EnRevision' };
        const review = await api.get('/expedientes', { params: reviewParams });
        combined = dedupeById([...(own?.data?.data ?? []), ...(review?.data?.data ?? [])]);
      }

      setItems(combined);
      setTotal(combined.length); // si tu backend pagina, puedes reemplazar por data.total
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
  }, [tecnicoId, q, estado, desde, hasta, page, pageSize, isReviewer]);

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
                    const id = getExpedienteId(r);
                    const no = getNoExpediente(r);
                    const unidad = r.unidad ?? r.Unidad ?? '—';
                    const fiscalia = r.fiscalia ?? r.Fiscalia ?? '—';
                    const creado = r.creado_en ?? r.creadoEn ?? r.created_at ?? r.fecha_registro;
                    const st = resolveEstado(r);

                    // Bloquear detalles al TÉCNICO propietario cuando está EnRevision
                    const ownerTecnicoId = getTecnicoIdFromRow(r);
                    const isOwner = ownerTecnicoId === tecnicoId;
                    const detailsDisabled = !isReviewer && isOwner && st === 'EnRevision';

                    const detailsBtn = (
                      <IconButton
                        aria-label="Detalle"
                        size="sm"
                        icon={<ExternalLinkIcon />}
                        isDisabled={!id || detailsDisabled}
                        onClick={() => id && navigate(`/expedientes/${id}`, { state: { noExpediente: no } })}
                      />
                    );

                    return (
                      <Tr key={`${id ?? 'sinid'}-${idx}`}>
                        <Td>{id ?? '—'}</Td>
                        <Td fontWeight="600">{no || `EXP-${id ?? idx}`}</Td>
                        <Td>{unidad} / {fiscalia}</Td>
                        <Td>{fmtDate(creado)}</Td>
                        <Td><Tag colorScheme={estadoColor(st)}>{st}</Tag></Td>
                        <Td textAlign="right">
                          {detailsDisabled ? (
                            <Tooltip label="Bloqueado mientras está en revisión">
                              {detailsBtn}
                            </Tooltip>
                          ) : detailsBtn}
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
