import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Text, Textarea, Button
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

export default function RechazoModal({ isOpen, onClose, onConfirm }) {
  const [just, setJust] = useState('');
  const canSend = just.trim().length >= 8;
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Rechazar expediente</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Indica una justificación para el rechazo (min. 8 caracteres).
          </Text>
          <Textarea value={just} onChange={(e) => setJust(e.target.value)} placeholder="Describe la razón del rechazo" />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">Cancelar</Button>
          <Button colorScheme="red" onClick={() => onConfirm(just)} isDisabled={!canSend} leftIcon={<CloseIcon />}>Rechazar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}