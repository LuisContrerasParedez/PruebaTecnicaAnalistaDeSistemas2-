import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Heading, HStack, Stack, Text,
  Table, Thead, Tbody, Tr, Th, Td,
  Input, InputGroup, InputLeftElement, Select, Switch,
  Button, IconButton, Badge, Spinner, Alert, AlertIcon,
  useColorModeValue, Stat, StatLabel, StatNumber, StatHelpText,
  Tooltip, SimpleGrid
} from '@chakra-ui/react';
import {
  SearchIcon, DownloadIcon, RepeatIcon,
  ArrowBackIcon, ArrowForwardIcon
} from '@chakra-ui/icons';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchExpedientesResumen,
  fetchExpedientesDetalle,
  exportExpedientesDetalleCsv,
  fetchExpedientesSerieDiaria,
  fetchIndiciosPorExpediente,
  fetchRechazosMotivos,
  clearCsv
} from '../../features/reportes/reportesSlice';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend,
  BarChart, Bar
} from 'recharts';

export default function ReportesPage() {
  const dispatch = useAppDispatch();
  const {
    resumenLoading, detalleLoading, csvLoading, serieLoading, indiciosLoading, motivosLoading,
    resumenError,  detalleError,  csvError,  serieError,  indiciosError,  motivosError,
    resumen, detalle, csvDownload, serie, indicios, motivos
  } = useAppSelector((s) => s.reportes || {});

  // Filtros
  const [q, setQ] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [estado, setEstado] = useState('');
  const [unidad, setUnidad] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [coordinadorId, setCoordinadorId] = useState('');

  const [porEstado, setPorEstado] = useState(false);       // ⚠️ boolean real
  const [topMotivos, setTopMotivos] = useState('10');

  // Paginación
  const detPage = detalle?.page ?? 1;
  const detPageSize = detalle?.pageSize ?? 50;
  const detTotal = detalle?.total ?? 0;
  const detTotalPages = Math.max(1, Math.ceil(detTotal / detPageSize));

  const indPage = indicios?.page ?? 1;
  const indPageSize = indicios?.pageSize ?? 50;
  const indTotal = indicios?.total ?? 0;
  const indTotalPages = Math.max(1, Math.ceil(indTotal / indPageSize));

  // Colores
  const cardBg     = useColorModeValue('white', 'gray.800');
  const headBg     = useColorModeValue('gray.50', 'whiteAlpha.100');
  const hoverBg    = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const borderCol  = useColorModeValue('gray.200', 'whiteAlpha.200');
  const subtleText = useColorModeValue('gray.600', 'gray.300');

  // Helpers
  const buildCommonParams = useCallback(() => {
    const p = {};
    if (desde) p.desde = desde;
    if (hasta) p.hasta = hasta;
    if (estado) p.estado = estado;
    if (unidad) p.unidad = unidad;
    if (tecnicoId !== '') p.tecnicoId = Number(tecnicoId);
    if (coordinadorId !== '') p.coordinadorId = Number(coordinadorId);
    return p;
  }, [desde, hasta, estado, unidad, tecnicoId, coordinadorId]);

  const getSerieParams = useCallback(() => {
    const common = buildCommonParams();
    // ✅ SOLO mandar si es true; si es false no enviamos el param (evita "0")
    return porEstado ? { ...common, porEstado: true } : { ...common };
  }, [buildCommonParams, porEstado]);

  const loadAll = useCallback(() => {
    const common = buildCommonParams();
    dispatch(fetchExpedientesResumen(common));
    dispatch(fetchExpedientesSerieDiaria(getSerieParams()));
    dispatch(fetchExpedientesDetalle({ ...common, q, page: 1, pageSize: detPageSize }));
    dispatch(fetchIndiciosPorExpediente({ ...common, page: 1, pageSize: indPageSize }));
    const top = topMotivos ? Number(topMotivos) : undefined;
    dispatch(fetchRechazosMotivos({ ...common, top }));
  }, [dispatch, buildCommonParams, getSerieParams, q, detPageSize, indPageSize, topMotivos]);

  useEffect(() => { loadAll(); }, []); // init

  // Al cambiar solo el switch, refrescar serie
  useEffect(() => {
    dispatch(fetchExpedientesSerieDiaria(getSerieParams()));
  }, [dispatch, getSerieParams]);

  // Descargar CSV
  useEffect(() => {
    if (csvDownload?.url) {
      const a = document.createElement('a');
      a.href = csvDownload.url;
      a.download = csvDownload.fileName || 'expedientes_detalle.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      dispatch(clearCsv());
    }
  }, [csvDownload, dispatch]);

  // Serie: pivot si es por estado
  const serieData = useMemo(() => {
    if (!Array.isArray(serie)) return [];
    if (!porEstado) return serie.map(r => ({ fecha: r.fecha, total: Number(r.total || 0) }));
    const byDate = new Map();
    const estadosSet = new Set();
    for (const r of serie) {
      const f = r.fecha;
      const e = r.estado || 'N/A';
      const t = Number(r.total || 0);
      estadosSet.add(e);
      if (!byDate.has(f)) byDate.set(f, { fecha: f });
      byDate.get(f)[e] = (byDate.get(f)[e] || 0) + t;
    }
    const rows = Array.from(byDate.values()).sort((a,b)=>a.fecha.localeCompare(b.fecha));
    return { rows, estados: Array.from(estadosSet) };
  }, [serie, porEstado]);

  const estadosSerie = useMemo(() => (porEstado ? (serieData.estados || []) : []), [porEstado, serieData]);
  const serieRows = useMemo(() => (porEstado ? (serieData.rows || []) : serieData), [porEstado, serieData]);

  const onBuscar = (e) => { e?.preventDefault?.(); loadAll(); };
  const onLimpiar = () => {
    setQ(''); setDesde(''); setHasta(''); setEstado(''); setUnidad(''); setTecnicoId(''); setCoordinadorId(''); setPorEstado(false); setTopMotivos('10');
    setTimeout(() => loadAll(), 0);
  };
  const onExportCsv = () => {
    const common = buildCommonParams();
    dispatch(exportExpedientesDetalleCsv({ ...common, q }));
  };

  const fmtDate = (s) => (typeof s === 'string' && s.length >= 10 ? s.slice(0,10) : (s ?? '—'));

  return (
    <Box>
      {/* Filtros */}
      <HStack justify="space-between" mb={4} wrap="wrap" gap={3}>
        <Heading size="md">Reportes</Heading>

        <HStack as="form" onSubmit={onBuscar} gap={2} wrap="wrap">
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={subtleText} />
            </InputLeftElement>
            <Input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Buscar #expediente / descripción / unidad"
              width="260px"
              variant="filled"
            />
          </InputGroup>

          <Input size="sm" type="date" value={desde} onChange={(e)=>setDesde(e.target.value)} variant="filled" />
          <Input size="sm" type="date" value={hasta} onChange={(e)=>setHasta(e.target.value)} variant="filled" />

          <Select size="sm" value={estado} onChange={(e)=>setEstado(e.target.value)} width="180px" variant="filled">
            <option value="">Estado (todos)</option>
            <option value="Borrador">Borrador</option>
            <option value="EnRevision">En Revisión</option>
            <option value="Rechazado">Rechazado</option>
            <option value="Aprobado">Aprobado</option>
          </Select>

          <Input size="sm" value={unidad} onChange={(e)=>setUnidad(e.target.value)} placeholder="Unidad" width="180px" variant="filled" />
          <Input size="sm" value={tecnicoId} onChange={(e)=>setTecnicoId(e.target.value)} placeholder="Técnico ID" width="130px" variant="filled" />
          <Input size="sm" value={coordinadorId} onChange={(e)=>setCoordinadorId(e.target.value)} placeholder="Coordinador ID" width="150px" variant="filled" />

          <HStack align="center" px={2} py={1} borderWidth="1px" borderRadius="md" borderColor={borderCol}>
            <Text fontSize="xs" color={subtleText}>Serie por estado</Text>
            <Switch size="sm" isChecked={porEstado} onChange={(e)=>setPorEstado(e.target.checked)} />
          </HStack>

          <HStack>
            <Button size="sm" colorScheme="blue" type="submit">Buscar</Button>
            <Button size="sm" variant="ghost" onClick={onLimpiar}>Limpiar</Button>
            <Tooltip label="Refrescar todos">
              <IconButton size="sm" icon={<RepeatIcon />} aria-label="Refrescar" onClick={loadAll} />
            </Tooltip>
          </HStack>
        </HStack>
      </HStack>


      {/* Detalle de expedientes */}
      <Box borderWidth="1px" borderRadius="lg" overflowX="auto" bg={cardBg} borderColor={borderCol} shadow="sm" mb={4}>
        <HStack justify="space-between" p={3} borderBottomWidth="1px" borderColor={borderCol}>
          <Heading size="sm">Detalle de expedientes</Heading>
          <HStack>
            <Select
              size="sm"
              value={detPageSize}
              onChange={(e)=>{
                const size = Number(e.target.value) || 50;
                const common = buildCommonParams();
                dispatch(fetchExpedientesDetalle({ ...common, q, page: 1, pageSize: size }));
              }}
              width="90px"
              variant="filled"
              title="Resultados por página"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
            <Button
              size="sm"
              leftIcon={<DownloadIcon />}
              onClick={onExportCsv}
              isLoading={csvLoading}
              isDisabled={csvLoading || !(detalle?.data?.length > 0)}
            >
              Exportar CSV
            </Button>
          </HStack>
        </HStack>

        <Table size="sm" sx={{ 'tbody tr:nth-of-type(even)': { bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.50') } }}>
          <Thead position="sticky" top={0} zIndex={1} bg={headBg} borderBottomWidth="1px" borderColor={borderCol}>
            <Tr>
              <Th>ID</Th>
              <Th>N° Expediente</Th>
              <Th>Fiscalía</Th>
              <Th>Unidad</Th>
              <Th>Estado</Th>
              <Th>Descripción</Th>
              <Th>Creado</Th>
              <Th>Actualizado</Th>
              <Th>Técnico</Th>
              <Th>Coordinador</Th>
              <Th isNumeric>Indicios</Th>
            </Tr>
          </Thead>
          <Tbody>
            {detalleLoading ? (
              <Tr><Td colSpan={11}><HStack py={8} justify="center"><Spinner /></HStack></Td></Tr>
            ) : (detalle?.data?.length ? (
              detalle.data.map((r) => (
                <Tr key={r.CodigoExpediente} _hover={{ bg: hoverBg }}>
                  <Td>{r.CodigoExpediente}</Td>
                  <Td>{r.no_expediente}</Td>
                  <Td>{r.fiscalia || '—'}</Td>
                  <Td>{r.unidad || '—'}</Td>
                  <Td><Badge>{r.estado}</Badge></Td>
                  <Td maxW="360px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{r.descripcion || '—'}</Td>
                  <Td>{fmtDate(r.creado_en)}</Td>
                  <Td>{fmtDate(r.actualizado_en)}</Td>
                  <Td>{r.tecnico_nombre || '—'}</Td>
                  <Td>{r.coordinador_nombre || '—'}</Td>
                  <Td isNumeric>{r.indicios_count ?? 0}</Td>
                </Tr>
              ))
            ) : (
              <Tr><Td colSpan={11} py={10} textAlign="center" color={subtleText}>Sin resultados</Td></Tr>
            ))}
          </Tbody>
        </Table>

        {/* Paginación detalle */}
        <HStack p={3} justify="space-between" wrap="wrap" gap={3} borderTopWidth="1px" borderColor={borderCol}>
          <Text fontSize="sm" color={subtleText}>{detTotal} registro(s) · Página {detPage} de {detTotalPages}</Text>
          <HStack>
            <Button size="sm" leftIcon={<ArrowBackIcon />} isDisabled={detPage <= 1}
              onClick={() => {
                const common = buildCommonParams();
                dispatch(fetchExpedientesDetalle({ ...common, q, page: detPage - 1, pageSize: detPageSize }));
              }}
              variant="outline" colorScheme="blue">Anterior</Button>
            <Button size="sm" rightIcon={<ArrowForwardIcon />} isDisabled={detPage >= detTotalPages}
              onClick={() => {
                const common = buildCommonParams();
                dispatch(fetchExpedientesDetalle({ ...common, q, page: detPage + 1, pageSize: detPageSize }));
              }}
              colorScheme="blue">Siguiente</Button>
          </HStack>
        </HStack>
      </Box>

      {/* Indicios por expediente */}
      <Box borderWidth="1px" borderRadius="lg" overflowX="auto" bg={cardBg} borderColor={borderCol} shadow="sm" mb={4}>
        <HStack justify="space-between" p={3} borderBottomWidth="1px" borderColor={borderCol}>
          <Heading size="sm">Indicios por expediente</Heading>
          {indiciosLoading && <Spinner size="sm" />}
        </HStack>
        <Table size="sm" sx={{ 'tbody tr:nth-of-type(even)': { bg: useColorModeValue('blackAlpha.50', 'whiteAlpha.50') } }}>
          <Thead position="sticky" top={0} zIndex={1} bg={headBg} borderBottomWidth="1px" borderColor={borderCol}>
            <Tr>
              <Th>ID</Th>
              <Th>N° Expediente</Th>
              <Th>Unidad</Th>
              <Th isNumeric>Indicios</Th>
              <Th>Primer indicio</Th>
              <Th>Último indicio</Th>
            </Tr>
          </Thead>
          <Tbody>
            {indiciosLoading ? (
              <Tr><Td colSpan={6}><HStack py={8} justify="center"><Spinner /></HStack></Td></Tr>
            ) : (indicios?.data?.length ? (
              indicios.data.map((r) => (
                <Tr key={r.CodigoExpediente} _hover={{ bg: hoverBg }}>
                  <Td>{r.CodigoExpediente}</Td>
                  <Td>{r.no_expediente}</Td>
                  <Td>{r.unidad || '—'}</Td>
                  <Td isNumeric>{r.indicios_count ?? 0}</Td>
                  <Td>{r.primer_indicio?.slice?.(0, 16) || '—'}</Td>
                  <Td>{r.ultimo_indicio?.slice?.(0, 16) || '—'}</Td>
                </Tr>
              ))
            ) : (
              <Tr><Td colSpan={6} py={10} textAlign="center" color={subtleText}>Sin resultados</Td></Tr>
            ))}
          </Tbody>
        </Table>

        {/* Paginación indicios */}
        <HStack p={3} justify="space-between" wrap="wrap" gap={3} borderTopWidth="1px" borderColor={borderCol}>
          <HStack>
            <Text fontSize="sm" color={subtleText}>{indTotal} registro(s) · Página {indPage} de {indTotalPages}</Text>
            <Select
              size="sm"
              value={indPageSize}
              onChange={(e)=>{
                const size = Number(e.target.value) || 50;
                const common = buildCommonParams();
                dispatch(fetchIndiciosPorExpediente({ ...common, page: 1, pageSize: size }));
              }}
              width="90px"
              variant="filled"
              title="Resultados por página"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </HStack>
          <HStack>
            <Button size="sm" leftIcon={<ArrowBackIcon />} isDisabled={indPage <= 1}
              onClick={() => {
                const common = buildCommonParams();
                dispatch(fetchIndiciosPorExpediente({ ...common, page: indPage - 1, pageSize: indPageSize }));
              }}
              variant="outline" colorScheme="blue">Anterior</Button>
            <Button size="sm" rightIcon={<ArrowForwardIcon />} isDisabled={indPage >= indTotalPages}
              onClick={() => {
                const common = buildCommonParams();
                dispatch(fetchIndiciosPorExpediente({ ...common, page: indPage + 1, pageSize: indPageSize }));
              }}
              colorScheme="blue">Siguiente</Button>
          </HStack>
        </HStack>
      </Box>

      {/* Motivos de rechazo */}
      <Box borderWidth="1px" borderRadius="lg" bg={cardBg} borderColor={borderCol} p={4} mb={12}>
        <HStack justify="space-between" mb={2} wrap="wrap" gap={3}>
          <Heading size="sm">Motivos de rechazo (Top)</Heading>
          <HStack>
            <Input size="sm" type="number" min={1} step={1} value={topMotivos}
              onChange={(e)=>setTopMotivos(e.target.value)} width="120px" variant="filled" placeholder="Top" />
            <Button size="sm" onClick={() => {
              const common = buildCommonParams();
              const top = topMotivos ? Number(topMotivos) : undefined;
              dispatch(fetchRechazosMotivos({ ...common, top }));
            }}>Aplicar</Button>
          </HStack>
        </HStack>

        {motivosLoading && <Spinner size="sm" />}

        <Stack direction={{ base: 'column', md: 'row' }} spacing={6} align="stretch">
          <Box flex="1" minH="280px">
            {Array.isArray(motivos) && motivos.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={motivos} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="motivo" interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <RTooltip />
                  <Legend />
                  <Bar dataKey="total" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <HStack h="100%" justify="center" color={subtleText}><Text>Proximamente!!!</Text></HStack>
            )}
          </Box>

          <Box flex="1" borderWidth="1px" borderRadius="lg" overflow="hidden" borderColor={borderCol}>
            <Table size="sm">
              <Thead bg={headBg}>
                <Tr>
                  <Th>Motivo</Th>
                  <Th isNumeric>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Array.isArray(motivos) && motivos.length ? (
                  motivos.map((m, idx) => (
                    <Tr key={idx} _hover={{ bg: hoverBg }}>
                      <Td maxW="420px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{m.motivo}</Td>
                      <Td isNumeric>{m.total}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr><Td colSpan={2} py={8} textAlign="center" color={subtleText}>Sin datos</Td></Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

function StatBox({ label, value, colorScheme = 'blue' }) {
  const borderCol  = useColorModeValue('gray.200', 'whiteAlpha.200');
  const cardBg     = useColorModeValue('white', 'gray.800');
  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg={cardBg} borderColor={borderCol}>
      <Stat>
        <StatLabel>{label}</StatLabel>
        <StatNumber>{Number(value || 0).toLocaleString()}</StatNumber>
        <StatHelpText><Badge colorScheme={colorScheme} variant="subtle">{label}</Badge></StatHelpText>
      </Stat>
    </Box>
  );
}
