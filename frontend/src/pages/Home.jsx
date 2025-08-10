
import {
  Box, Container, Heading, Text, HStack, VStack, Stack,
  Card, CardBody, CardHeader, Stat, StatLabel, StatNumber, Skeleton,
  Button, Icon, Divider, useColorModeValue, Link as CLink,
  List, ListItem, Tag, SimpleGrid
} from '@chakra-ui/react';
import {
  AddIcon, TimeIcon, CheckCircleIcon, InfoOutlineIcon, SettingsIcon
} from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAuth, selectReportes } from '../app/store';
import { resumenReportes } from '../features/reportes/reportesSlice';

function useRoleFlags() {
  const { user } = useAppSelector(selectAuth);
  const name = (user?.rol || user?.rol_nombre || '').toString().toLowerCase();
  const isAdmin       = name.includes('admin')       || user?.CodigoRol === 1;
  const isCoordinator = name.includes('coordinador') || user?.CodigoRol === 2;
  const isTecnico     = name.includes('tecnic')      || user?.CodigoRol === 3;
  const isAuditor     = name.includes('audit')       || user?.CodigoRol === 4;
  return { isAdmin, isCoordinator, isTecnico, isAuditor };
}

const Glass = (props) => {
  const bg = useColorModeValue('rgba(255,255,255,0.82)', 'rgba(255,255,255,0.06)');
  const border = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  return (
    <Card
      bg={bg}
      backdropFilter="saturate(180%) blur(14px)"
      border="1px solid"
      borderColor={border}
      shadow="sm"
      {...props}
    />
  );
};

const KPI = ({ label, value, loading }) => (
  <Glass>
    <CardBody>
      {loading ? (
        <Skeleton height="28px" />
      ) : (
        <Stat>
          <StatLabel color="gray.500">{label}</StatLabel>
          <StatNumber fontSize="2xl">{value ?? 0}</StatNumber>
        </Stat>
      )}
    </CardBody>
  </Glass>
);

export default function Home() {
  const dispatch = useAppDispatch();
  const { isAdmin, isCoordinator, isTecnico } = useRoleFlags();
  const { resumen, loading } = useAppSelector(selectReportes);

  useEffect(() => {
    // Trae solo lo necesario para KPIs + listas cortas
    dispatch(resumenReportes({ rango: 'mes', top: 5 })).catch(() => {});
  }, [dispatch]);

  const kpi = {
    registrados: resumen?.totales?.registrados ?? 0,
    aprobados:   resumen?.totales?.aprobados ?? 0,
    rechazados:  resumen?.totales?.rechazados ?? 0,
  };

  // Colecciones pequeñas para no “cargar” la vista
  const enRevision = resumen?.enRevision?.slice?.(0, 5) ?? [];
  const borradores = resumen?.borradores?.slice?.(0, 5) ?? [];
  const actividad  = resumen?.actividad?.slice?.(0, 6) ?? [];

  return (
    <Box py={{ base: 4, md: 8 }}>
      <Container maxW="7xl">

        {/* Admin strip (arriba, discreto) */}
        {isAdmin && (
          <>
            <Glass mb={5}>
              <CardBody>
                <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
                  <HStack>
                    <SettingsIcon />
                    <Heading size="sm">Administración</Heading>
                  </HStack>
                  <HStack spacing={2}>
                    <Button as={Link} to="/admin/usuarios" size="sm" variant="outline">Usuarios</Button>
                    <Button as={Link} to="/admin/roles" size="sm" variant="outline">Roles</Button>
                  </HStack>
                </HStack>
              </CardBody>
            </Glass>
          </>
        )}

        {/* Hero + Acciones rápidas (solo lo que aplica al rol) */}
        <Glass mb={6}>
          <CardBody>
            <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="start" gap={4}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" letterSpacing="-0.02em">Bienvenido</Heading>
                <Text color="gray.500">Sistema de Gestión de Evidencias — DICRI / MP Guatemala</Text>
              </VStack>
              <HStack spacing={2} wrap="wrap">
                {(isTecnico || isAdmin) && (
                  <Button as={Link} to="/expedientes/nuevo" leftIcon={<AddIcon />} colorScheme="teal">
                    Nuevo expediente
                  </Button>
                )}
                {(isCoordinator || isAdmin) && (
                  <Button as={Link} to="/expedientes?estado=EnRevision" leftIcon={<TimeIcon />}>
                    En revisión
                  </Button>
                )}
                {(isCoordinator || isAdmin) && (
                  <Button as={Link} to="/reportes" leftIcon={<CheckCircleIcon />}>
                    Reportes
                  </Button>
                )}
              </HStack>
            </Stack>
          </CardBody>
        </Glass>

        {/* KPIs compactos */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
          <KPI label="Registrados (mes)" value={kpi.registrados} loading={loading} />
          <KPI label="Aprobados (mes)"  value={kpi.aprobados}  loading={loading} />
          <KPI label="Rechazados (mes)" value={kpi.rechazados} loading={loading} />
        </SimpleGrid>

        {/* Dos columnas: Mi trabajo / Actividad o Revisión / Actividad */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Izquierda: Worklist según rol */}
          <Glass>
            <CardHeader pb={2}>
              <HStack justify="space-between">
                <Heading size="sm">
                  {isCoordinator || isAdmin ? 'En revisión' : 'Mis borradores'}
                </Heading>
                <CLink
                  as={Link}
                  to={isCoordinator || isAdmin ? '/expedientes?estado=EnRevision' : '/expedientes?estado=Borrador'}
                  fontSize="sm"
                  color="teal.500"
                >
                  Ver todo
                </CLink>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              {loading ? (
                <VStack align="stretch" spacing={2}>
                  <Skeleton h="18px" /><Skeleton h="18px" /><Skeleton h="18px" />
                </VStack>
              ) : (isCoordinator || isAdmin ? enRevision : borradores).length ? (
                <List spacing={2}>
                  {(isCoordinator || isAdmin ? enRevision : borradores).map((e) => (
                    <ListItem key={e.CodigoExpediente}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600">{e.no_expediente}</Text>
                          <Text color="gray.500" fontSize="sm">
                            {(e.unidad || e.fiscalia || '—')} · {(e.tecnico_nombre || 'Técnico')}
                          </Text>
                        </VStack>
                        <Tag size="sm" colorScheme={isCoordinator || isAdmin ? 'yellow' : 'gray'}>
                          {isCoordinator || isAdmin ? 'En revisión' : 'Borrador'}
                        </Tag>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <VStack py={6} color="gray.500">
                  <InfoOutlineIcon />
                  <Text fontSize="sm">
                    {isCoordinator || isAdmin ? 'No hay expedientes en revisión' : 'No tienes borradores'}
                  </Text>
                </VStack>
              )}
            </CardBody>
          </Glass>

          {/* Derecha: Actividad reciente */}
          <Glass>
            <CardHeader pb={2}>
              <HStack justify="space-between">
                <Heading size="sm">Actividad reciente</Heading>
                <CLink
                  as={Link}
                  to={isAdmin ? '/admin/bitacora' : '/reportes'}
                  fontSize="sm"
                  color="teal.500"
                >
                  {isAdmin ? 'Ver bitácora' : 'Ver reportes'}
                </CLink>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              {loading ? (
                <VStack align="stretch" spacing={2}>
                  <Skeleton h="18px" /><Skeleton h="18px" /><Skeleton h="18px" />
                </VStack>
              ) : actividad.length ? (
                <List spacing={2}>
                  {actividad.map((a, idx) => (
                    <ListItem key={idx}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="600">{a.accion || 'Actualización'}</Text>
                          <Text color="gray.500" fontSize="sm">
                            {a.entidad} #{a.entidad_id} · {new Date(a.creado_en).toLocaleString()}
                          </Text>
                        </VStack>
                        <Tag size="sm" variant="subtle">{a.usuario_nombre || '—'}</Tag>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <VStack py={6} color="gray.500">
                  <InfoOutlineIcon />
                  <Text fontSize="sm">Sin actividad reciente</Text>
                </VStack>
              )}
            </CardBody>
          </Glass>
        </SimpleGrid>

        {/* Separador suave */}
        <Divider my={8} opacity={0.5} />

        {/* Atajo único a “Gestión de expedientes” (para no saturar con más tarjetas) */}
        <HStack justify="center">
          <Button as={Link} to="/expedientes" variant="ghost" rightIcon={<CheckCircleIcon />}>
            Ir a Gestión de expedientes
          </Button>
        </HStack>
      </Container>
    </Box>
  );
}
