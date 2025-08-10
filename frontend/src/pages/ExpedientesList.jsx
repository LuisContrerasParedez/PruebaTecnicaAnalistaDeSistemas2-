// src/pages/ExpedientesList.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import {
  Box, Heading, HStack, VStack, Stack,
  Table, Thead, Tbody, Tr, Th, Td,
  Input, Select, Button, IconButton, Tag,
  useDisclosure, useToast, Text, Divider,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Textarea,
  Container, useColorModeValue, Card, CardBody, CardHeader,
  SimpleGrid, FormControl, FormLabel, Grid, GridItem, Skeleton, Spinner,
} from '@chakra-ui/react';
import {
  CheckIcon, CloseIcon, AddIcon, EditIcon, DeleteIcon, ArrowForwardIcon, InfoOutlineIcon,
} from '@chakra-ui/icons';

import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAuth, selectUsuarios } from '../app/store';

import {
  fetchExpedienteById,
  createExpediente,
  updateExpediente,
  sendExpedienteToReview,
  approveExpediente,
  rejectExpediente,
} from '../features/expedientes/expedientesSlice';

import {
  fetchIndiciosByExpediente,
  createIndicio,
  updateIndicio,
  deleteIndicio,
} from '../features/indicios/indiciosSlice';

import {
  fetchAdjuntos,
  createAdjunto,
  deleteAdjunto,
} from '../features/adjuntos/adjuntosSlice';

import { fetchUsuarios } from '../features/usuarios/usuariosSlice';

// ---------- helpers ----------
const resolveId = (x) =>
  x?.id ?? x?.CodigoExpediente ?? x?.codigoExpediente ?? x?.codigo ?? x?.Codigo ?? null;

const resolveEstado = (x) =>
  x?.estado ?? x?.Estado ?? 'Borrador';

// ---------- UI: Glass ----------
const Glass = (props) => {
  const bg = useColorModeValue('rgba(255,255,255,0.82)', 'rgba(255,255,255,0.06)');
  const border = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  return (
    <Card bg={bg} backdropFilter="saturate(180%) blur(14px)" border="1px solid" borderColor={border} shadow="sm" {...props} />
  );
};

// ---------- Modal de Indicio ----------
function IndicioModal({ isOpen, onClose, initial, expedienteId, onSave }) {
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

// ---------- Modal de Rechazo ----------
function RechazoModal({ isOpen, onClose, onConfirm }) {
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
          <Textarea
            value={just}
            onChange={(e) => setJust(e.target.value)}
            placeholder="Describe la razón del rechazo"
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">Cancelar</Button>
          <Button colorScheme="red" onClick={() => onConfirm(just)} isDisabled={!canSend} leftIcon={<CloseIcon />}>
            Rechazar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ---------- Página: Gestión de Expediente ----------
export default function ExpedienteGestionPage({ expedienteId: expedienteIdProp }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user } = useAppSelector(selectAuth);

  // Roles
  const rolName = (user?.rol || user?.rol_nombre || '').toString().toLowerCase();
  const isAdmin = rolName.includes('admin') || user?.CodigoRol === 1;
  const isCoordinator = rolName.includes('coordinador') || user?.CodigoRol === 2;
  const isTecnico = rolName.includes('tecnic') || user?.CodigoRol === 3;

  // Estado redux
  const { current: expediente, loading: loadingExp } = useAppSelector((s) => s.expedientes || {});
  const indiciosState = useAppSelector((s) => s.indicios || {});
  const adjuntosState = useAppSelector((s) => s.adjuntos || {});
  const { items: usuarios, loading: usuariosLoading } = useAppSelector(selectUsuarios);

  const expedienteId = resolveId(expediente) || expedienteIdProp || null;
  const estado = resolveEstado(expediente);

  const indicios = useMemo(
    () => (expedienteId ? (indiciosState.byExpediente?.[expedienteId] || []) : []),
    [indiciosState, expedienteId]
  );
  const adjuntosKey = expedienteId ? `EXPEDIENTE:${expedienteId}` : null;
  const adjuntos = useMemo(() => {
    const raw = adjuntosKey ? (adjuntosState.byEntidad?.[adjuntosKey] || []) : [];
    return raw.map((r) => ({
      id: r.id ?? r.CodigoAdjunto ?? r.codigoAdjunto ?? null,
      entidad: r.entidad,
      entidadId: r.entidadId ?? r.entidad_id ?? null,
      nombreArchivo: r.nombreArchivo ?? r.nombre_archivo ?? '',
      ruta: r.ruta ?? '',
      tipoMime: r.tipoMime ?? r.tipo_mime ?? '',
      tamanoBytes: r.tamanoBytes ?? r.tamano_bytes ?? 0,
      publicUrl: r?.ruta ? (r.ruta.startsWith('/') ? r.ruta : `/local/${r.ruta}`) : '#',
    }));
  }, [adjuntosState, adjuntosKey]);


  // arriba del componente (una sola vez)
  const API_BASE = api.defaults?.baseURL || import.meta.env.VITE_API_BASE_URL || '';
  // si tu base es "http://localhost:4000/api", quita el "/api"
  const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, '');  // -> "http://localhost:4000"

  // al normalizar adjuntos:
  const adjuntosUrl = useMemo(() => {
    const raw = adjuntosKey ? (adjuntosState.byEntidad?.[adjuntosKey] || []) : [];
    return raw.map(r => {
      const ruta = r.ruta ?? '';
      const publicUrl = ruta.startsWith('/')
        ? `${BACKEND_ORIGIN}${ruta}`              // ej: "/files/..." -> http://localhost:4000/files/...
        : `${BACKEND_ORIGIN}/local/${ruta}`;      // ej: "EXPEDIENTE/5/xxx.png" -> http://localhost:4000/local/EXPEDIENTE/5/xxx.png
      return { ...r, publicUrl };
    });
  }, [adjuntosState, adjuntosKey]);



  // Formulario expediente
  const [form, setForm] = useState({
    fiscalia: '', unidad: '', descripcion: '', ubicacion_texto: '', municipio: '', departamento: ''
  });
  const [coordinadorId, setCoordinadorId] = useState(''); // obligatorio al crear

  const rechazoModal = useDisclosure();
  const indicioModal = useDisclosure();
  const [editingIndicio, setEditingIndicio] = useState(null);

  const puedeEnviar = isTecnico || isAdmin;
  const puedeDecidir = isCoordinator || isAdmin;
  const puedeEditar = estado === 'Borrador' || estado === 'Rechazado';

  // --- Adjuntos (subida local)
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);


  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFileToUpload(f);
  };

  const handleUploadClick = async () => {
    try {
      if (!fileToUpload) {
        toast({ title: 'Selecciona un archivo', status: 'warning' });
        return;
      }
      setUploading(true);

      // 1) Subir físicamente a la carpeta local (sirviendo luego /local/*)
      //    Aquí también usamos entidadId=1 para la ruta local.
      const fd = new FormData();
      fd.append('file', fileToUpload);

      const { data: up } = await api.post(`/local-files/upload/EXPEDIENTE/${expedienteId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const payload = {
        entidad: 'EXPEDIENTE',
        entidadId: expedienteId,
        nombreArchivo: fileToUpload.name,
        ruta: up?.ruta || `EXPEDIENTE/1/${up?.filename ?? fileToUpload.name}`,
        tipoMime: fileToUpload.type || up?.mime || 'application/octet-stream',
        tamanoBytes: fileToUpload.size ?? up?.size ?? 0,
        hashOpcional: '',
        subidoPor: user?.id || null,                      // opcional
      };

      await api.post('/adjuntos', payload);

      // 3) Refrescar la lista (ojo: también con entidadId=1)
      await dispatch(fetchAdjuntos({ entidad: 'EXPEDIENTE', entidadId: expedienteId }));

      setFileToUpload(null);
      toast({ title: 'Adjunto subido y registrado', status: 'success' });
    } catch (e) {
      toast({ title: 'Error al subir/registrar adjunto', description: e?.message || String(e), status: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // Cargar expediente si viene id por props/route
  useEffect(() => {
    if (expedienteIdProp) dispatch(fetchExpedienteById(expedienteIdProp));
  }, [dispatch, expedienteIdProp]);

  // Sincroniza form cuando llega el expediente
  useEffect(() => {
    if (expediente) {
      setForm({
        fiscalia: expediente.fiscalia || '',
        unidad: expediente.unidad || '',
        descripcion: expediente.descripcion || '',
        ubicacion_texto: expediente.ubicacion_texto || '',
        municipio: expediente.municipio || '',
        departamento: expediente.departamento || ''
      });
    }
  }, [expediente]);

  // Cargar indicios y adjuntos cuando tenemos id
  useEffect(() => {
    if (expedienteId) {
      dispatch(fetchIndiciosByExpediente({ expedienteId }));
      dispatch(fetchAdjuntos({ entidad: 'EXPEDIENTE', entidadId: expedienteId }));
    }
  }, [dispatch, expedienteId]);

  // Cargar usuarios (para coordinadores)
  useEffect(() => {
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      dispatch(fetchUsuarios({ page: 1, pageSize: 50 })); // evita 400 con pageSize grandes
    }
  }, [dispatch]);

  const coordinadores = useMemo(() => {
    const arr = Array.isArray(usuarios) ? usuarios : [];
    return arr
      .filter((u) => {
        const roleName =
          (u.rol_nombre ?? u.rol?.nombre ?? u.RolNombre ?? u.rol ?? '').toString().toLowerCase();
        const roleId = Number(u.CodigoRol ?? u.rol_id ?? u.idRol ?? u.rol?.CodigoRol);
        return roleName.includes('coordinador') || roleId === 2;
      })
      .map((u) => {
        const id = (u.CodigoUsuario ?? u.usuarioId ?? u.id ?? u.codigo);
        const label = (
          u.nombreCompleto ||
          u.nombre ||
          `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() ||
          u.username ||
          `Usuario ${id}`
        ).trim();
        return { id, label };
      })
      .filter(c => c.id != null)
      .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
  }, [usuarios]);

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  // Guardar (crear/actualizar)
  const handleGuardar = async () => {
    try {
      if (!expedienteId) {
        // Al crear por primera vez, coordinador obligatorio (para usar luego en "Enviar a revisión")
        const coo = parseInt(coordinadorId, 10);
        if (!coo || Number.isNaN(coo)) {
          toast({ title: 'Coordinador requerido', status: 'warning' });
          return;
        }
        // Backend requiere codigoTecnico
        const codigoTecnico = Number(
          user?.CodigoTecnico ?? user?.sub ?? user?.CodigoUsuario ?? user?.id ?? 0
        );
        if (!codigoTecnico) {
          toast({ title: 'No se pudo identificar al técnico', status: 'error' });
          return;
        }

        // IMPORTANTE: el endpoint /expedientes (create) NO guarda coordinador.
        const created = await dispatch(createExpediente({ ...form, codigoTecnico })).unwrap();

        // Resolver id con tolerancia
        const newId = resolveId(created);
        if (!newId) {
          toast({ title: 'Expediente creado, pero no se obtuvo el ID', status: 'warning' });
          return;
        }

        // Refrescar current con el ID correcto y cargar hijos
        await dispatch(fetchExpedienteById(newId));
        dispatch(fetchIndiciosByExpediente({ expedienteId: newId }));
        dispatch(fetchAdjuntos({ entidad: 'EXPEDIENTE', entidadId: newId }));

        // mantener coordinador elegido
        setCoordinadorId(String(coo));
        toast({ title: 'Expediente creado', status: 'success' });
      } else {
        await dispatch(updateExpediente({ id: expedienteId, payload: form })).unwrap();
        toast({ title: 'Expediente actualizado', status: 'success' });
      }
    } catch (e) {
      toast({ title: 'Error al guardar', description: e?.message || String(e), status: 'error' });
    }
  };

  const handleEnviarRevision = async () => {
    try {
      if (!expedienteId) return;
      const coo = parseInt(coordinadorId, 10);
      if (!coo || Number.isNaN(coo)) {
        toast({ title: 'Coordinador requerido', status: 'warning' });
        return;
      }
      await dispatch(sendExpedienteToReview({ id: expedienteId, coordinadorId: coo })).unwrap();
      toast({ title: 'Expediente enviado a revisión', status: 'success' });
    } catch (e) {
      toast({ title: 'Error al enviar a revisión', description: e.message, status: 'error' });
    }
  };

  const handleAprobar = async () => {
    try {
      if (!expedienteId) return;
      await dispatch(approveExpediente(expedienteId)).unwrap();
      toast({ title: 'Expediente aprobado', status: 'success' });
    } catch (e) {
      toast({ title: 'Error al aprobar', description: e.message, status: 'error' });
    }
  };

  const handleRechazar = async (justificacion) => {
    try {
      if (!expedienteId) return;
      await dispatch(rejectExpediente({ id: expedienteId, justificacion })).unwrap();
      toast({ title: 'Expediente rechazado', status: 'info' });
      rechazoModal.onClose();
    } catch (e) {
      toast({ title: 'Error al rechazar', description: e.message, status: 'error' });
    }
  };

  // ==== helpers arriba del componente (o dentro) ====
  const FILES_BASE = import.meta.env.VITE_FILES_BASE_URL || '/public';
  // si sirves /public estático, esto construye el link: `${FILES_BASE}/${ruta}`

  async function sha256OfFile(file) {
    const buf = await file.arrayBuffer();
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ==== estado dentro del componente (reemplaza tu adjForm por esto) ====
  const [file, setFile] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);

  // ==== handler de selección ====
  const onPickFile = async (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f || null);
  };




  // dentro de ExpedienteGestionPage
  const handleSaveIndicio = async (data) => {
    try {
      if (!expedienteId) {
        toast({ title: 'Guarda el expediente primero', status: 'warning' });
        return;
      }

      // fecha del <input type="datetime-local">: "YYYY-MM-DDTHH:mm" (o con :ss)
      const toIso = (v) => {
        if (!v) return null;
        const val = v.length === 16 ? `${v}:00` : v; // agrega segundos si faltan
        const d = new Date(val);                      // interpreta como hora local
        return Number.isNaN(d.getTime()) ? null : d.toISOString(); // "2025-08-10T15:41:14.207Z"
      };

      // numero del técnico (por si el backend no lo saca del token)
      const codigoTecnico = Number(
        user?.CodigoTecnico ?? user?.CodigoUsuario ?? user?.sub ?? user?.id ?? 0
      ) || undefined;

      // 👇 payload EXACTO
      const payload = {
        expedienteId: Number(expedienteId),                       // required
        tipo: data.tipo,                                          // string
        descripcion: data.descripcion || 'string',                // string (o null si prefieres)
        color: data.color || 'string',
        tamano: data.tamano || 'string',
        peso: data.peso !== '' && !Number.isNaN(Number(data.peso))
          ? Number(data.peso)                                     // number
          : 0,                                                    // si prefieres null: usa null
        ubicacion: data.ubicacion || 'string',
        codigoTecnico,                                            // number
        fecha_hora: toIso(data.fecha_hora) || new Date().toISOString(), // ISO con Z
        observaciones: data.observaciones || 'string',
      };

      if (editingIndicio?.id) {
        await dispatch(updateIndicio({ id: editingIndicio.id, payload })).unwrap();
        toast({ title: 'Indicio actualizado', status: 'success' });
      } else {
        await dispatch(createIndicio(payload)).unwrap();
        toast({ title: 'Indicio creado', status: 'success' });
      }

      indicioModal.onClose();
    } catch (e) {
      toast({ title: 'Error en indicio', description: e.message, status: 'error' });
    }
  };

  const handleDeleteIndicio = async (id) => {
    try {
      await dispatch(deleteIndicio(id)).unwrap();
      toast({ title: 'Indicio eliminado', status: 'info' });
    } catch (e) {
      toast({ title: 'No se pudo eliminar', description: e.message, status: 'error' });
    }
  };

  // ----- Adjuntos (metadatos)
  const [adjForm, setAdjForm] = useState({ nombreArchivo: '', ruta: '', tipoMime: '', tamanoBytes: '', hashOpcional: '' });
  const onAdjChange = (k) => (e) => setAdjForm((s) => ({ ...s, [k]: e.target.value }));


  const handleDeleteAdj = async (id) => {
    try { await dispatch(deleteAdjunto(id)).unwrap(); toast({ title: 'Adjunto eliminado', status: 'info' }); }
    catch (e) { toast({ title: 'No se pudo eliminar', description: e.message, status: 'error' }); }
  };

  return (
    <Box py={{ base: 4, md: 8 }}>
      <Container maxW="7xl">
        <Glass mb={6}>
          <CardBody>
            <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align="start" gap={4}>
              <VStack align="start" spacing={1}>
                <Heading size="lg">Gestión de evidencias</Heading>
                <Text color="gray.500">Expedientes DICRI / MP Guatemala</Text>
                {expedienteId && (
                  <HStack><Tag>{`#${expedienteId}`}</Tag><Tag colorScheme="purple">{estado}</Tag></HStack>
                )}
              </VStack>
              <HStack spacing={2} wrap="wrap">
                {puedeEditar && (
                  <Button onClick={handleGuardar} colorScheme="teal" leftIcon={<CheckIcon />}>
                    {expedienteId ? 'Guardar cambios' : 'Guardar borrador'}
                  </Button>
                )}
                {estado === 'Borrador' && (isTecnico || isAdmin) && (
                  <Button
                    onClick={handleEnviarRevision}
                    rightIcon={<ArrowForwardIcon />}
                    isDisabled={!coordinadorId || !expedienteId}
                  >
                    Enviar a revisión
                  </Button>
                )}
                {estado === 'EnRevision' && (isCoordinator || isAdmin) && (
                  <>
                    <Button colorScheme="green" onClick={handleAprobar} leftIcon={<CheckIcon />}>Aprobar</Button>
                    <Button colorScheme="red" onClick={rechazoModal.onOpen} leftIcon={<CloseIcon />}>Rechazar</Button>
                  </>
                )}
              </HStack>
            </Stack>
          </CardBody>
        </Glass>

        {/* Datos generales del expediente */}
        <Glass mb={6}>
          <CardHeader pb={2}><Heading size="sm">Datos del expediente</Heading></CardHeader>
          <CardBody pt={0}>
            {loadingExp ? (
              <VStack align="stretch" spacing={2}><Skeleton h="24px" /><Skeleton h="24px" /><Skeleton h="24px" /></VStack>
            ) : (
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

                {/* Coordinador (requerido al crear; se usa en Enviar a revisión) */}
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
                      <Text mt={1} fontSize="xs" color="gray.500">
                        * Se utiliza cuando envíes a revisión; no se guarda en el borrador.
                      </Text>
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
            )}
          </CardBody>
        </Glass>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Indicios */}
          <Glass>
            <CardHeader pb={2}>
              <HStack justify="space-between" align="center">
                <Heading size="sm">Indicios del expediente</Heading>
                {puedeEditar && (
                  <Button size="sm" leftIcon={<AddIcon />} onClick={() => { setEditingIndicio(null); indicioModal.onOpen(); }} isDisabled={!expedienteId}>Agregar</Button>
                )}
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              {!expedienteId ? (
                <VStack py={6} color="gray.500">
                  <InfoOutlineIcon />
                  <Text fontSize="sm">Guarda el expediente para poder registrar indicios</Text>
                </VStack>
              ) : indiciosState.loading ? (
                <Spinner />
              ) : indicios.length ? (
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Tipo</Th>
                      <Th>Descripción</Th>
                      <Th>Color</Th>
                      <Th>Tamaño</Th>
                      <Th>Peso</Th>
                      <Th>Ubicación</Th>
                      <Th>Fecha</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {indicios.map((r) => (
                      <Tr key={r.id}>
                        <Td>{r.tipo}</Td>
                        <Td maxW="240px" isTruncated title={r.descripcion}>{r.descripcion}</Td>
                        <Td>{r.color}</Td>
                        <Td>{r.tamano}</Td>
                        <Td>{r.peso}</Td>
                        <Td>{r.ubicacion}</Td>
                        <Td>{r.fecha_hora ? new Date(r.fecha_hora).toLocaleString() : '—'}</Td>
                        <Td textAlign="right">
                          {puedeEditar && (
                            <HStack justify="flex-end">
                              <IconButton aria-label="Editar" size="xs" icon={<EditIcon />} onClick={() => { setEditingIndicio(r); indicioModal.onOpen(); }} />
                              <IconButton aria-label="Eliminar" size="xs" icon={<DeleteIcon />} onClick={() => handleDeleteIndicio(r.id)} />
                            </HStack>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <VStack py={6} color="gray.500"><InfoOutlineIcon /><Text fontSize="sm">No hay indicios</Text></VStack>
              )}
            </CardBody>
          </Glass>
          {/* Adjuntos (archivo local + registro) */}
          <Glass>
            <CardHeader pb={2}>
              <Heading size="sm">Adjuntos</Heading>
            </CardHeader>
            <CardBody pt={0}>
              {!expedienteId ? (
                <VStack py={6} color="gray.500">
                  <InfoOutlineIcon />
                  <Text fontSize="sm">Guarda el expediente para poder agregar adjuntos</Text>
                </VStack>
              ) : (
                <>
                  {/* Selector de archivo + subir */}
                  <FormControl>
                    <FormLabel>Archivo</FormLabel>
                    <Input type="file" onChange={onFileChange} />
                  </FormControl>

                  <HStack mt={3}>
                    <Button onClick={handleUploadClick} isLoading={uploading} isDisabled={!fileToUpload}>
                      Subir y registrar
                    </Button>
                  </HStack>


                  {/* Lista de adjuntos */}
                  {adjuntosState.loading ? <Spinner /> : adjuntos.length ? (
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Archivo</Th>
                          <Th>Tipo</Th>
                          <Th>Tamaño</Th>
                          <Th textAlign="right">Acciones</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {adjuntos.map((a, idx) => (
                          <Tr key={a.id ?? `${a.entidad}-${a.entidadId}-${idx}`}>
                            <Td maxW="260px" isTruncated title={a.nombreArchivo}>
                              {a.publicUrl && a.publicUrl !== '#'
                                ? <a href={a.publicUrl} target="_blank" rel="noreferrer">{a.nombreArchivo || '(sin nombre)'}</a>
                                : (a.nombreArchivo || '(sin nombre)')}
                            </Td>
                            <Td>{a.tipoMime || '—'}</Td>
                            <Td>{a.tamanoBytes ? a.tamanoBytes.toLocaleString() : '—'}</Td>
                            <Td textAlign="right">
                              {puedeEditar && (
                                <IconButton
                                  aria-label="Eliminar"
                                  size="xs"
                                  icon={<DeleteIcon />}
                                  onClick={() => handleDeleteAdj(a.id)}
                                  isDisabled={!a.id}
                                />
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <VStack py={6} color="gray.500">
                      <InfoOutlineIcon />
                      <Text fontSize="sm">Sin adjuntos</Text>
                    </VStack>
                  )}
                </>
              )}
            </CardBody>
          </Glass>
        </SimpleGrid>

        <Divider my={8} opacity={0.5} />
        <VStack align="center">
          <Text fontSize="sm" color="gray.500">El proceso finaliza cuando el expediente es aprobado.</Text>
        </VStack>
      </Container>

      {/* Modales */}
      <IndicioModal
        isOpen={indicioModal.isOpen}
        onClose={indicioModal.onClose}
        initial={editingIndicio}
        expedienteId={expedienteId}
        onSave={handleSaveIndicio}
      />
      <RechazoModal
        isOpen={rechazoModal.isOpen}
        onClose={rechazoModal.onClose}
        onConfirm={handleRechazar}
      />
    </Box>
  );
}
