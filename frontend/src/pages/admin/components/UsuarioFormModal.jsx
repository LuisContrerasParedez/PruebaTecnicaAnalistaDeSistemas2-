import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input, Select, Switch, HStack
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function UsuarioFormModal({ isOpen, onClose, initial, onSubmit }) {
  const [form, setForm] = useState({ nombre:'', correo:'', codigoRol:1, unidad:'', activo:true, password:'' });

  useEffect(()=>{
    if (initial) setForm({
      nombre: initial.nombre || '',
      correo: initial.correo || '',
      codigoRol: initial.CodigoRol || 1,
      unidad: initial.unidad || '',
      activo: !!initial.activo,
      password: ''
    });
    else setForm({ nombre:'', correo:'', codigoRol:1, unidad:'', activo:true, password:'' });
  }, [initial, isOpen]);

  const submit = (e)=>{ e.preventDefault(); onSubmit(form); };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={submit}>
        <ModalHeader>{initial ? 'Editar usuario' : 'Nuevo usuario'}</ModalHeader>
        <ModalBody display="grid" gap={3}>
          <FormControl isRequired>
            <FormLabel>Nombre</FormLabel>
            <Input value={form.nombre} onChange={e=>setForm(f=>({...f, nombre:e.target.value}))}/>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Correo</FormLabel>
            <Input type="email" value={form.correo} onChange={e=>setForm(f=>({...f, correo:e.target.value}))}/>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Rol</FormLabel>
            <Select value={form.codigoRol} onChange={e=>setForm(f=>({...f, codigoRol:Number(e.target.value)}))}>
              <option value={1}>Admin CSII</option>
              <option value={2}>Coordinador DICRI</option>
              <option value={3}>Técnico DICRI</option>
              <option value={4}>Auditor MP</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Unidad</FormLabel>
            <Input value={form.unidad} onChange={e=>setForm(f=>({...f, unidad:e.target.value}))}/>
          </FormControl>
          {!initial && (
            <FormControl>
              <FormLabel>Contraseña</FormLabel>
              <Input type="password" value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))}/>
            </FormControl>
          )}
          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <FormLabel m="0">Activo</FormLabel>
            <Switch isChecked={form.activo} onChange={e=>setForm(f=>({...f, activo:e.target.checked}))}/>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button onClick={onClose} variant="ghost">Cancelar</Button>
            <Button colorScheme="teal" type="submit">{initial?'Guardar':'Crear'}</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
