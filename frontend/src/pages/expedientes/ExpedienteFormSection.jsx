import React from 'react';
import {
  Grid, GridItem, FormControl, FormLabel, Input, Textarea, Text, Skeleton, VStack, Select
} from '@chakra-ui/react';

export default function ExpedienteFormSection({
  form, onChange, puedeEditar,
  loadingExp,
  expediente,
  expedienteId,
  coordinadorId,
  setCoordinadorId,
  coordinadores,
  usuariosLoading
}) {
  if (loadingExp) {
    return (
      <VStack align="stretch" spacing={2}><Skeleton h="24px" /><Skeleton h="24px" /><Skeleton h="24px" /></VStack>
    );
  }

  return (
    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
      <FormControl isDisabled={!puedeEditar}>
        <FormLabel>Fiscalía</FormLabel>
        <Input value={form.fiscalia} onChange={onChange('fiscalia')} />
      </FormControl>
      <FormControl isDisabled={!puedeEditar}>
        <FormLabel>Unidad</FormLabel>
        <Input value={form.unidad} onChange={onChange('unidad')} />
      </FormControl>

      <FormControl isDisabled={!puedeEditar}>
        <FormLabel>Municipio</FormLabel>
        <Input value={form.municipio} onChange={onChange('municipio')} />
      </FormControl>
      <FormControl isDisabled={!puedeEditar}>
        <FormLabel>Departamento</FormLabel>
        <Input value={form.departamento} onChange={onChange('departamento')} />
      </FormControl>

      <GridItem colSpan={{ base: 1, md: 2 }}>
        <FormControl isRequired={!expedienteId} isDisabled={!puedeEditar}>
          <FormLabel>Coordinador</FormLabel>
          <Select
            placeholder={usuariosLoading ? 'Cargando coordinadores...' : 'Seleccione coordinador'}
            value={coordinadorId}
            onChange={(e) => setCoordinadorId(e.target.value)}
          >
            {usuariosLoading ? null : (
              coordinadores.length
                ? coordinadores.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))
                : <option value="" disabled>No hay coordinadores disponibles</option>
            )}
          </Select>
          {!expedienteId && (
            <Text mt={1} fontSize="xs" color="gray.500"> * Se utiliza cuando envíes a revisión; no se guarda en el borrador. </Text>
          )}
        </FormControl>
      </GridItem>

      <GridItem colSpan={{ base: 1, md: 2 }}>
        <FormControl isDisabled={!puedeEditar}>
          <FormLabel>Ubicación (texto)</FormLabel>
          <Input value={form.ubicacion_texto} onChange={onChange('ubicacion_texto')} />
        </FormControl>
      </GridItem>
      <GridItem colSpan={{ base: 1, md: 2 }}>
        <FormControl isDisabled={!puedeEditar}>
          <FormLabel>Descripción</FormLabel>
          <Textarea value={form.descripcion} onChange={onChange('descripcion')} />
        </FormControl>
      </GridItem>
      {expediente?.creado_en && (
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <Text color="gray.500" fontSize="sm">Registrado: {new Date(expediente.creado_en).toLocaleString()}</Text>
        </GridItem>
      )}
    </Grid>
  );
}