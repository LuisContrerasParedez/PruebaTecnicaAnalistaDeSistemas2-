import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Heading, HStack, Button, IconButton, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Alert, AlertIcon, Spinner, useDisclosure, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input,
  Textarea, Menu, MenuButton, MenuList, MenuItem, AlertDialog, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, useToast
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectRoles } from '../../app/store';
import { listRoles, createRol, updateRol, deleteRol } from '../../features/roles/rolesSlice';

function PermisosCell({ permisos }) {
  const text = useMemo(() => {
    if (permisos == null) return '—';
    if (typeof permisos === 'string') return permisos;
    try { return JSON.stringify(permisos); } catch { return String(permisos); }
  }, [permisos]);
  return <Td whiteSpace="pre-wrap" maxW="720px">{text}</Td>;
}

function RoleFormModal({ isOpen, onClose, initial }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [permisos, setPermisos] = useState(
    typeof initial?.permisos === 'string' ? initial?.permisos : (initial?.permisos ? JSON.stringify(initial.permisos) : '')
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNombre(initial?.nombre ?? '');
    setPermisos(typeof initial?.permisos === 'string'
      ? initial?.permisos
      : (initial?.permisos ? JSON.stringify(initial.permisos) : '')
    );
  }, [initial, isOpen]);

  const onSubmit = async () => {
    if (!nombre.trim()) {
      toast({ status: 'warning', title: 'El nombre es obligatorio' });
      return;
    }
    setSaving(true);
    try {
      const payload = { nombre: nombre.trim(), permisos: permisos?.trim() || null };
      if (initial?.CodigoRol ?? initial?.id) {
        const id = initial.CodigoRol ?? initial.id;
        await dispatch(updateRol({ id, payload })).unwrap();
        toast({ status: 'success', title: 'Rol actualizado' });
      } else {
        await dispatch(createRol(payload)).unwrap();
        toast({ status: 'success', title: 'Rol creado' });
      }
      onClose();
    } catch (e) {
      toast({ status: 'error', title: String(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initial ? 'Editar rol' : 'Nuevo rol'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3} isRequired>
            <FormLabel>Nombre</FormLabel>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Coordinador, Técnico, Admin…" />
          </FormControl>
          <FormControl>
            <FormLabel>Permisos (texto o JSON)</FormLabel>
            <Textarea
              value={permisos}
              onChange={(e) => setPermisos(e.target.value)}
              placeholder='Ej: {"usuarios:read": true, "expedientes:approve": true}'
              rows={6}
              fontFamily="mono"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose} isDisabled={saving}>Cancelar</Button>
          <Button colorScheme="teal" onClick={onSubmit} isLoading={saving}>
            {initial ? 'Guardar' : 'Crear'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function DeleteDialog({ isOpen, onClose, onConfirm, rol }) {
  const cancelRef = useRef();
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>Eliminar rol</AlertDialogHeader>
        <AlertDialogBody>
          ¿Eliminar definitivamente el rol <b>{rol?.nombre}</b>? Esta acción no se puede deshacer.
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>Cancelar</Button>
          <Button colorScheme="red" onClick={onConfirm} ml={3}>Eliminar</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function RolesPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { items = [], loading, error } = useAppSelector(selectRoles);

  const modal = useDisclosure();
  const del = useDisclosure();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { dispatch(listRoles()); }, [dispatch]);

  const openCreate = () => { setEditing(null); modal.onOpen(); };
  const openEdit = (r) => { setEditing(r); modal.onOpen(); };
  const openDelete = (r) => { setDeleting(r); del.onOpen(); };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteRol(deleting.CodigoRol ?? deleting.id)).unwrap();
      toast({ status: 'success', title: 'Rol eliminado' });
    } catch (e) {
      toast({ status: 'error', title: String(e) });
    } finally {
      del.onClose();
    }
  };

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Heading size="md">Roles</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={openCreate}>Nuevo rol</Button>
      </HStack>

      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {typeof error === 'string' ? error : (error?.message || 'Ocurrió un error')}
        </Alert>
      )}

      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th w="80px">ID</Th>
              <Th>Nombre</Th>
              <Th>Permisos</Th>
              <Th w="100px">Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr><Td colSpan={4} py={10} textAlign="center"><Spinner /></Td></Tr>
            ) : items.length ? (
              items.map((r) => (
                <Tr key={r.CodigoRol ?? r.id}>
                  <Td>{r.CodigoRol ?? r.id}</Td>
                  <Td><Badge>{r.nombre}</Badge></Td>
                  <PermisosCell permisos={r.permisos} />
                  <Td>
                    <Menu>
                      <MenuButton as={IconButton} size="sm" icon={<ChevronDownIcon />} aria-label="Acciones" />
                      <MenuList>
                        <MenuItem onClick={() => openEdit(r)}>Editar</MenuItem>
                        <MenuItem color="red.500" onClick={() => openDelete(r)}>Eliminar</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr><Td colSpan={4} py={10} textAlign="center" color="gray.500">Sin roles</Td></Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modales */}
      <RoleFormModal isOpen={modal.isOpen} onClose={modal.onClose} initial={editing} />
      <DeleteDialog isOpen={del.isOpen} onClose={del.onClose} onConfirm={confirmDelete} rol={deleting} />
    </Box>
  );
}
