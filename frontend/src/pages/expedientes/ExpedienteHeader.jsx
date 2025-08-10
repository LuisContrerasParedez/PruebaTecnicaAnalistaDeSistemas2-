import React from 'react';
import { Stack, HStack, VStack, Heading, Text, Tag, Button, Tooltip } from '@chakra-ui/react';
import { CheckIcon, CloseIcon, ArrowForwardIcon } from '@chakra-ui/icons';

export default function ExpedienteHeader({
  expedienteId,
  estado,
  puedeEditar,
  isTecnico,
  isAdmin,
  isCoordinator,
  onGuardar,
  onEnviarRevision,
  onAprobar,
  onRechazar,
  canEnviar,
  enviarTooltip, // 👈 nuevo
}) {
  const isReviewer = isAdmin || isCoordinator;

  return (
    <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="start" gap={4}>
      <VStack align="start" spacing={1}>
        <Heading size="lg">Gestión de evidencias</Heading>
        <Text color="gray.500">Expedientes DICRI / MP Guatemala</Text>
        {expedienteId && (
          <HStack>
            <Tag>{`#${expedienteId}`}</Tag>
            <Tag colorScheme="purple">{estado}</Tag>
          </HStack>
        )}
      </VStack>

      <HStack spacing={2} wrap="wrap">
        {puedeEditar && (
          <Button onClick={onGuardar} colorScheme="teal" leftIcon={<CheckIcon />}>
            {expedienteId ? 'Guardar cambios' : 'Guardar borrador'}
          </Button>
        )}

        {/* Técnico: enviar a revisión desde Borrador */}
        {!isReviewer && estado === 'Borrador' && (
          <Tooltip
            isDisabled={canEnviar}
            label={enviarTooltip}
            hasArrow
            placement="bottom"
            openDelay={200}
          >
            <Button
              onClick={onEnviarRevision}
              rightIcon={<ArrowForwardIcon />}
              isDisabled={!canEnviar}
              variant="outline"
            >
              Revisión
            </Button>
          </Tooltip>
        )}

        {/* Admin / Coordinador: aprobar / rechazar en EnRevision */}
        {isReviewer && estado === 'EnRevision' && (
          <>
            <Button colorScheme="green" onClick={onAprobar} leftIcon={<CheckIcon />}>
              Aprobar
            </Button>
            <Button colorScheme="red" onClick={onRechazar} leftIcon={<CloseIcon />}>
              Rechazar
            </Button>
          </>
        )}
      </HStack>
    </Stack>
  );
}
