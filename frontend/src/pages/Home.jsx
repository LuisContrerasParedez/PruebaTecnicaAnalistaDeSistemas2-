// src/pages/Home.jsx
import {
  Box, Heading, Text, SimpleGrid, Card, CardBody, HStack, VStack, Button, Badge, useColorModeValue
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Tile = ({ title, desc, to, meta, action = 'Abrir' }) => {
  const shadow = useColorModeValue('subtle', 'none');
  return (
    <Card as={Link} to={to} _hover={{ transform: 'translateY(-2px)' }} transition="150ms" shadow={shadow}>
      <CardBody>
        <VStack align="start" spacing={2}>
          <HStack w="full" justify="space-between">
            <Heading size="md" letterSpacing="-0.01em">{title}</Heading>
            {meta && <Badge>{meta}</Badge>}
          </HStack>
          <Text color="gray.500">{desc}</Text>
          <Button mt={2} size="sm" variant="glass" alignSelf="flex-end">{action}</Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default function Home() {
  return (
    <Box>
      <VStack align="start" spacing={2} mb={8}>
        <Heading size="lg" letterSpacing="-0.02em">Panel principal</Heading>
        <Text color="gray.500">Sistema de Gestión de Evidencias — DICRI / MP Guatemala</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
        <Tile
          title="Expedientes"
          desc="Crea, edita y gestiona el ciclo de vida de los expedientes."
          to="/expedientes"
          meta="Gestión"
          action="Ir a expedientes"
        />
        <Tile
          title="Indicios"
          desc="Registra objetos/evidencias, características y ubicación."
          to="/expedientes" // usualmente desde el detalle; puedes crear una lista global si quieres
          meta="Evidencia"
        />
        <Tile
          title="Revisión y decisiones"
          desc="Aprobar o rechazar con justificación. Flujo coordinador."
          to="/expedientes?estado=EnRevision"
          meta="Flujo"
        />
        <Tile
          title="Reportes"
          desc="Registros, aprobaciones y rechazos con filtros y exportación."
          to="/reportes"
          meta="Informes"
        />
        <Tile
          title="Adjuntos"
          desc="Carga y consulta de archivos vinculados a expedientes o indicios."
          to="/expedientes" // adjuntos viven en detalle
          meta="Archivos"
        />
        <Tile
          title="Bitácora"
          desc="Auditoría: acciones, usuario, entidad, fecha y detalle."
          to="/bitacora"
          meta="Auditoría"
        />
        <Tile
          title="Usuarios"
          desc="Altas, edición, activación/desactivación de usuarios."
          to="/usuarios"
          meta="Admin"
        />
        <Tile
          title="Roles"
          desc="Permisos y perfiles de acceso al sistema."
          to="/roles"
          meta="Admin"
        />
        <Tile
          title="Catálogos"
          desc="Tipos de indicio, colores, ubicaciones y más."
          to="/catalogos"
          meta="Config"
        />
      </SimpleGrid>
    </Box>
  );
}
