import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Heading, VStack, FormControl, FormLabel, Input, Textarea, HStack, Button, useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { createExpediente } from '../features/expedientes/expedientesSlice';

export default function ExpedienteForm() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    fiscalia: '', unidad: '', descripcion: '', ubicacion_texto: '', municipio: '', departamento: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await dispatch(createExpediente(form)).unwrap();
      toast({ title: 'Expediente creado', status: 'success', position: 'top' });
      nav(`/expedientes/${res.CodigoExpediente}`);
    } catch (err) {
      toast({ title: 'Error', description: String(err), status: 'error', position: 'top' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Heading size="lg" mb={6}>Nuevo expediente</Heading>
      <form onSubmit={onSubmit}>
        <VStack align="stretch" spacing={4} maxW="3xl">
          <HStack>
            <FormControl isRequired>
              <FormLabel>Fiscalía</FormLabel>
              <Input value={form.fiscalia} onChange={set('fiscalia')} />
            </FormControl>
            <FormControl>
              <FormLabel>Unidad</FormLabel>
              <Input value={form.unidad} onChange={set('unidad')} />
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel>Ubicación (texto)</FormLabel>
            <Input value={form.ubicacion_texto} onChange={set('ubicacion_texto')} />
          </FormControl>

          <HStack>
            <FormControl>
              <FormLabel>Municipio</FormLabel>
              <Input value={form.municipio} onChange={set('municipio')} />
            </FormControl>
            <FormControl>
              <FormLabel>Departamento</FormLabel>
              <Input value={form.departamento} onChange={set('departamento')} />
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel>Descripción</FormLabel>
            <Textarea rows={4} value={form.descripcion} onChange={set('descripcion')} />
          </FormControl>

          <HStack>
            <Button type="submit" isLoading={loading}>Guardar </Button>
            <Button variant="glass" onClick={() => nav(-1)} type="button">Cancelar</Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}
