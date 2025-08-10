import React, { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, SimpleGrid, FormControl, FormLabel,
  Input, Textarea, Button
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

export default function IndicioModal({ isOpen, onClose, initial, expedienteId, onSave }) {
  const [form, setForm] = useState(() => ({
    expedienteId,
    tipo: initial?.tipo || '',
    descripcion: initial?.descripcion || '',
    color: initial?.color || '',
    tamano: initial?.tamano || '',
    peso: initial?.peso || '',
    ubicacion: initial?.ubicacion || '',
    fecha_hora: initial?.fecha_hora || '',
    observaciones: initial?.observaciones || ''
  }));

  useEffect(() => {
    setForm({
      expedienteId,
      tipo: initial?.tipo || '',
      descripcion: initial?.descripcion || '',
      color: initial?.color || '',
      tamano: initial?.tamano || '',
      peso: initial?.peso || '',
      ubicacion: initial?.ubicacion || '',
      fecha_hora: initial?.fecha_hora || '',
      observaciones: initial?.observaciones || ''
    });
  }, [initial, expedienteId]);

  const handle = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initial?.id ? 'Editar indicio' : 'Nuevo indicio'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            <FormControl isRequired>
              <FormLabel>Tipo</FormLabel>
              <Input value={form.tipo} onChange={handle('tipo')} />
            </FormControl>
            <FormControl>
              <FormLabel>Color</FormLabel>
              <Input value={form.color} onChange={handle('color')} />
            </FormControl>
            <FormControl>
              <FormLabel>Tamaño</FormLabel>
              <Input value={form.tamano} onChange={handle('tamano')} />
            </FormControl>
            <FormControl>
              <FormLabel>Peso (kg)</FormLabel>
              <Input value={form.peso} onChange={handle('peso')} />
            </FormControl>
            <FormControl>
              <FormLabel>Ubicación</FormLabel>
              <Input value={form.ubicacion} onChange={handle('ubicacion')} />
            </FormControl>
            <FormControl>
              <FormLabel>Fecha y hora</FormLabel>
              <Input type="datetime-local" value={form.fecha_hora} onChange={handle('fecha_hora')} />
            </FormControl>
          </SimpleGrid>
          <FormControl mt={3}>
            <FormLabel>Descripción</FormLabel>
            <Textarea value={form.descripcion} onChange={handle('descripcion')} />
          </FormControl>
          <FormControl mt={3}>
            <FormLabel>Observaciones</FormLabel>
            <Textarea value={form.observaciones} onChange={handle('observaciones')} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose} variant="ghost">Cancelar</Button>
          <Button colorScheme="teal" onClick={() => onSave(form)} leftIcon={<CheckIcon />}>Guardar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}