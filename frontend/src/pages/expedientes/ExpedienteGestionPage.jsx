// src/pages/expedientes/ExpedienteGestionPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Container, Divider, VStack, Text, SimpleGrid, CardBody, CardHeader, Heading,
  useDisclosure, useToast
} from '@chakra-ui/react';

import Glass from './Glass';
import ExpedienteHeader from './ExpedienteHeader';
import ExpedienteFormSection from './ExpedienteFormSection';
import IndiciosSection from './IndiciosSection';
import AdjuntosSection from './AdjuntosSection';
import IndicioModal from './IndicioModal';
import RechazoModal from './RechazoModal';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectAuth, selectUsuarios } from '../../app/store';
import { resolveEstado, resolveId } from './resolvers';

// thunks
import {
  fetchExpedienteById,
  createExpediente,
  updateExpediente,
  sendExpedienteToReview,
  approveExpediente,
  rejectExpediente
} from '../../features/expedientes/expedientesSlice';
import {
  fetchIndiciosByExpediente,
  createIndicio,
  updateIndicio,
  deleteIndicio
} from '../../features/indicios/indiciosSlice';
import { fetchAdjuntos, deleteAdjunto } from '../../features/adjuntos/adjuntosSlice';
import { fetchUsuarios } from '../../features/usuarios/usuariosSlice';

export default function ExpedienteGestionPage({ expedienteId: expedienteIdProp }) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user } = useAppSelector(selectAuth);

  // roles
  const rolName = (user?.rol || user?.rol_nombre || '').toString().toLowerCase();
  const isAdmin = rolName.includes('admin') || user?.CodigoRol === 1;
  const isCoordinator = rolName.includes('coordinador') || user?.CodigoRol === 2;
  const isTecnico = rolName.includes('tecnic') || user?.CodigoRol === 3;

  // Redux state
  const { current: expediente, loading: loadingExp } = useAppSelector((s) => s.expedientes || {});
  const indiciosState = useAppSelector((s) => s.indicios || {});
  const adjuntosState = useAppSelector((s) => s.adjuntos || {});
  const { items: usuarios, loading: usuariosLoading } = useAppSelector(selectUsuarios);

  // --- nuevo vs edición
  const isNew = expedienteIdProp == null;
  const expedienteId = isNew ? null : (resolveId(expediente) || Number(expedienteIdProp) || null);
  const estado = isNew ? 'Borrador' : resolveEstado(expediente);

  // Indicios
  const indicios = useMemo(() => {
    if (!expedienteId) return [];
    const byExp = indiciosState.byExpediente || {};
    return byExp[String(expedienteId)] || byExp[expedienteId] || [];
  }, [indiciosState, expedienteId]);

  // Adjuntos
  const adjuntosKey = expedienteId ? `EXPEDIENTE:${expedienteId}` : null;
  const adjuntosCount = useMemo(() => {
    return adjuntosKey ? (adjuntosState.byEntidad?.[adjuntosKey]?.length || 0) : 0;
  }, [adjuntosState, adjuntosKey]);

   
  useEffect(() => {
  if (!isNew && expediente) {
    console.log('expediente desde API', expediente); // 👈
    setForm(toForm(expediente));
    
  }
}, [isNew, expediente]);


  
  // Form expediente (controlado)
  const [form, setForm] = useState({
    fiscalia: '',
    unidad: '',
    descripcion: '',
    ubicacion_texto: '',
    municipio: '',
    departamento: ''
  });
  const [coordinadorId, setCoordinadorId] = useState('');

  const rechazoModal = useDisclosure();
  const indicioModal = useDisclosure();
  const [editingIndicio, setEditingIndicio] = useState(null);

  const puedeEditar = isAdmin || isCoordinator || isNew || estado === 'Borrador' || estado === 'Rechazado';

  // Cargar expediente por id de ruta
  useEffect(() => {
    if (!isNew && expedienteIdProp) {
      dispatch(fetchExpedienteById(expedienteIdProp));
    }
  }, [dispatch, expedienteIdProp, isNew]);

  // Función de mapeo: SIEMPRE sobreescribe el form con lo de la API
  const toForm = (exp) => ({
    fiscalia:        exp?.fiscalia        ?? exp?.Fiscalia        ?? '',
    unidad:          exp?.unidad          ?? exp?.Unidad          ?? '',
    descripcion:     exp?.descripcion     ?? exp?.Descripcion     ?? '',
    ubicacion_texto: exp?.ubicacion_texto ?? exp?.ubicacionTexto  ?? exp?.ubicacion ?? '',
    municipio:       exp?.municipio       ?? exp?.Municipio       ?? '',
    departamento:    exp?.departamento    ?? exp?.Departamento    ?? ''
  });

  // Cuando llega el expediente desde la API: PISAR SIEMPRE el form y coordinador
  useEffect(() => {
    if (!isNew && expediente) {
      setForm(toForm(expediente));
      const coo =
        expediente?.coordinadorId ??
        expediente?.CodigoCoordinador ??
        expediente?.coordinador?.id ??
        expediente?.coordinador_id ??
        '';
      setCoordinadorId(coo !== null && coo !== undefined ? String(coo) : '');
    }
  }, [isNew, expediente]);

  // Cargar indicios y adjuntos
  useEffect(() => {
    if (!isNew && expedienteId) {
      dispatch(fetchIndiciosByExpediente({ expedienteId }));
      dispatch(fetchAdjuntos({ entidad: 'EXPEDIENTE', entidadId: expedienteId }));
    }
  }, [dispatch, expedienteId, isNew]);

  // Cargar coordinadores
  useEffect(() => {
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      dispatch(fetchUsuarios({ page: 1, pageSize: 50 }));
    }
  }, [dispatch, usuarios]);

  const coordinadores = useMemo(() => {
    const arr = Array.isArray(usuarios) ? usuarios : [];
    return arr
      .filter((u) => {
        const roleName = (u.rol_nombre ?? u.rol?.nombre ?? u.RolNombre ?? u.rol ?? '').toString().toLowerCase();
        const roleId = Number(u.CodigoRol ?? u.rol_id ?? u.idRol ?? u.rol?.CodigoRol);
        return roleName.includes('coordinador') || roleId === 2;
      })
      .map((u) => {
        const id = (u.CodigoUsuario ?? u.usuarioId ?? u.id ?? u.codigo);
        const label = (u.nombreCompleto || u.nombre || `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || u.username || `Usuario ${id}`).trim();
        return { id, label };
      })
      .filter((c) => c.id != null)
      .sort((a, b) => a.label.localeCompare(b.label, 'es', { sensitivity: 'base' }));
  }, [usuarios]);

  const onChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  // Guardar
  const handleGuardar = async () => {
    try {
      if (!expedienteId) {
        const coo = parseInt(coordinadorId, 10);
        if (!coo || Number.isNaN(coo)) return toast({ title: 'Coordinador requerido', status: 'warning' });
        const codigoTecnico = Number(user?.CodigoTecnico ?? user?.sub ?? user?.CodigoUsuario ?? user?.id ?? 0);
        if (!codigoTecnico) return toast({ title: 'No se pudo identificar al técnico', status: 'error' });
        const created = await dispatch(createExpediente({ ...form, codigoTecnico, coordinadorId: coo })).unwrap();
        const newId = resolveId(created);
        if (!newId) return toast({ title: 'Expediente creado, pero no se obtuvo el ID', status: 'warning' });
        await dispatch(fetchExpedienteById(newId));
        dispatch(fetchIndiciosByExpediente({ expedienteId: newId }));
        dispatch(fetchAdjuntos({ entidad: 'EXPEDIENTE', entidadId: newId }));
        toast({ title: 'Expediente creado', status: 'success' });
      } else {
        await dispatch(updateExpediente({ id: expedienteId, payload: { ...form, coordinadorId } })).unwrap();
        await dispatch(fetchExpedienteById(expedienteId)); // refresca con valores canon
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
      if (!coo || Number.isNaN(coo)) return toast({ title: 'Coordinador requerido', status: 'warning' });
      await dispatch(sendExpedienteToReview({ id: expedienteId, coordinadorId: coo })).unwrap();
      await dispatch(fetchExpedienteById(expedienteId));
      toast({ title: 'Expediente enviado a revisión', status: 'success' });
    } catch (e) {
      toast({ title: 'Error al enviar a revisión', description: e.message, status: 'error' });
    }
  };

  const handleAprobar = async () => {
    try {
      if (!expedienteId) return;
      await dispatch(approveExpediente(expedienteId)).unwrap();
      await dispatch(fetchExpedienteById(expedienteId));
      toast({ title: 'Expediente aprobado', status: 'success' });
    } catch (e) {
      toast({ title: 'Error al aprobar', description: e.message, status: 'error' });
    }
  };

  const handleRechazar = async (justificacion) => {
    try {
      if (!expedienteId) return;
      await dispatch(rejectExpediente({ id: expedienteId, justificacion })).unwrap();
      await dispatch(fetchExpedienteById(expedienteId));
      toast({ title: 'Expediente rechazado', status: 'info' });
      rechazoModal.onClose();
    } catch (e) {
      toast({ title: 'Error al rechazar', description: e.message, status: 'error' });
    }
  };

  // Indicio
  const handleSaveIndicio = async (data) => {
    try {
      if (!expedienteId) {
        toast({ title: 'Guarda el expediente primero', status: 'warning' });
        return;
      }
      const toIso = (v) => {
        if (!v) return null;
        const val = v.length === 16 ? `${v}:00` : v;
        const d = new Date(val);
        return Number.isNaN(d.getTime()) ? null : d.toISOString();
      };

      const codigoTecnico =
        Number(user?.CodigoTecnico ?? user?.CodigoUsuario ?? user?.sub ?? user?.id ?? 0) || undefined;

      const payload = {
        expedienteId: Number(expedienteId),
        tipo: data.tipo,
        descripcion: data.descripcion || 'string',
        color: data.color || 'string',
        tamano: data.tamano || 'string',
        peso: data.peso !== '' && !Number.isNaN(Number(data.peso)) ? Number(data.peso) : 0,
        ubicacion: data.ubicacion || 'string',
        codigoTecnico,
        fecha_hora: toIso(data.fecha_hora) || new Date().toISOString(),
        observaciones: data.observaciones || 'string'
      };

      if (editingIndicio?.id) {
        await dispatch(updateIndicio({ id: editingIndicio.id, payload })).unwrap();
        toast({ title: 'Indicio actualizado', status: 'success' });
      } else {
        await dispatch(createIndicio(payload)).unwrap();
        toast({ title: 'Indicio creado', status: 'success' });
      }

      await dispatch(fetchIndiciosByExpediente({ expedienteId }));
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

  const handleDeleteAdj = async (id) => {
    try {
      await dispatch(deleteAdjunto(id)).unwrap();
      toast({ title: 'Adjunto eliminado', status: 'info' });
    } catch (e) {
      toast({ title: 'No se pudo eliminar', description: e.message, status: 'error' });
    }
  };

  const indiciosLoading = !!(indiciosState.loading || indiciosState.status === 'loading');

  // Requisitos para enviar a revisión
  const requisitos = {
    id: !!expedienteId,
    coordinador: !!coordinadorId,
    indicios: indicios.length > 0,
    adjuntos: adjuntosCount > 0
  };
  const faltantes = Object.entries(requisitos)
    .filter(([, ok]) => !ok)
    .map(([k]) => {
      if (k === 'id') return 'Guarda el expediente para obtener un ID';
      if (k === 'coordinador') return 'Selecciona un coordinador';
      if (k === 'indicios') return 'Registra al menos un indicio';
      if (k === 'adjuntos') return 'Agrega al menos un adjunto';
      return k;
    });

  const canEnviar = faltantes.length === 0;
  const enviarTooltip = canEnviar ? '' : `No puedes enviar todavía:\n• ${faltantes.join('\n• ')}`;

  return (
    <Box py={{ base: 4, md: 8 }}>
      <Container maxW="7xl">
        <Glass mb={6}>
          <CardBody>
            <ExpedienteHeader
              expedienteId={expedienteId}
              estado={estado}
              puedeEditar={puedeEditar}
              isTecnico={isTecnico}
              isAdmin={isAdmin}
              isCoordinator={isCoordinator}
              onGuardar={handleGuardar}
              onEnviarRevision={handleEnviarRevision}
              onAprobar={handleAprobar}
              onRechazar={rechazoModal.onOpen}
              canEnviar={canEnviar}
              enviarTooltip={enviarTooltip}
            />
          </CardBody>
        </Glass>

        <Glass mb={6}>
          <CardHeader pb={2}>
            <Heading size="sm">Datos del expediente</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <ExpedienteFormSection
              form={form}
              onChange={onChange}
              puedeEditar={puedeEditar}
              loadingExp={loadingExp}
              expediente={expediente}
              expedienteId={expedienteId}
              coordinadorId={coordinadorId}
              setCoordinadorId={setCoordinadorId}
              coordinadores={coordinadores}
              usuariosLoading={usuariosLoading}
            />
          </CardBody>
        </Glass>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Glass>
            <IndiciosSection
              expedienteId={expedienteId}
              puedeEditar={puedeEditar}
              indicios={indicios}
              indiciosLoading={indiciosLoading}
              onAdd={() => {
                setEditingIndicio(null);
                indicioModal.onOpen();
              }}
              onEdit={(r) => {
                setEditingIndicio(r);
                indicioModal.onOpen();
              }}
              onDelete={handleDeleteIndicio}
            />
          </Glass>

          <Glass>
            <AdjuntosSection
              expedienteId={expedienteId}
              puedeEditar={puedeEditar}
              user={user}
              adjuntosState={adjuntosState}
              dispatch={dispatch}
              fetchAdjuntosThunk={fetchAdjuntos}
              onDeleteAdj={handleDeleteAdj}
              toast={toast}
            />
          </Glass>
        </SimpleGrid>

        <Divider my={8} opacity={0.5} />
        <VStack align="center">
          <Text fontSize="sm" color="gray.500">
            El proceso finaliza cuando el expediente es aprobado.
          </Text>
        </VStack>
      </Container>

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
