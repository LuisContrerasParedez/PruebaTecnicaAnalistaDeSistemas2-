// src/pages/admin/components/ResetPasswordModal.jsx
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, FormControl, FormLabel, Input, HStack, Text
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

export default function ResetPasswordModal({ isOpen, onClose, usuario, onSubmit }) {
  const [password, setPassword] = useState('');
  useEffect(()=>{ if(isOpen) setPassword(''); }, [isOpen]);

  const submit = (e)=>{ e.preventDefault(); onSubmit(password); };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={submit}>
        <ModalHeader>Resetear contraseña</ModalHeader>
        <ModalBody display="grid" gap={3}>
          <Text fontSize="sm" color="gray.600">
            Usuario: <strong>{usuario?.nombre}</strong> ({usuario?.correo})
          </Text>
          <FormControl isRequired>
            <FormLabel>Nueva contraseña</FormLabel>
            <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button onClick={onClose} variant="ghost">Cancelar</Button>
            <Button colorScheme="teal" type="submit">Guardar</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
