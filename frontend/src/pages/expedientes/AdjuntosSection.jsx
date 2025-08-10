import React, { useMemo, useState } from 'react';
import {
  CardHeader, CardBody, Heading, VStack, Text, FormControl, FormLabel, Input, HStack,
  Button, Table, Thead, Tbody, Tr, Th, Td, Spinner, IconButton
} from '@chakra-ui/react';
import { DeleteIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { api } from '../../lib/api';

export default function AdjuntosSection({
  expedienteId,
  puedeEditar,
  user,
  adjuntosState,
  dispatch,
  fetchAdjuntosThunk,
  onDeleteAdj,
  toast,
}) {
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);

  const API_BASE = api?.defaults?.baseURL || import.meta.env.VITE_API_BASE_URL || '';
  const BACKEND_ORIGIN = API_BASE.replace(/\/api\/?$/, '');
  const adjuntosKey = expedienteId ? `EXPEDIENTE:${expedienteId}` : null;

  const adjuntos = useMemo(() => {
    const raw = adjuntosKey ? (adjuntosState.byEntidad?.[adjuntosKey] || []) : [];
    return raw.map((r) => {
      const id = r.id ?? r.CodigoAdjunto ?? r.codigoAdjunto ?? null;
      const entidadId = r.entidadId ?? r.entidad_id ?? null;
      const nombreArchivo = r.nombreArchivo ?? r.nombre_archivo ?? '';
      const ruta = r.ruta ?? '';
      const tipoMime = r.tipoMime ?? r.tipo_mime ?? '';
      const tamanoBytes = r.tamanoBytes ?? r.tamano_bytes ?? 0;
      const publicUrl = ruta
        ? (ruta.startsWith('/') ? `${BACKEND_ORIGIN}${ruta}` : `${BACKEND_ORIGIN}/local/${ruta}`)
        : '#';
      return { id, entidad: r.entidad, entidadId, nombreArchivo, ruta, tipoMime, tamanoBytes, publicUrl };
    });
  }, [adjuntosState, adjuntosKey, BACKEND_ORIGIN]);

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
      const fd = new FormData();
      fd.append('file', fileToUpload);
      const { data: up } = await api.post(`/local-files/upload/EXPEDIENTE/${expedienteId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const payload = {
        entidad: 'EXPEDIENTE',
        entidadId: expedienteId,
        nombreArchivo: fileToUpload.name,
        ruta: up?.ruta || `EXPEDIENTE/${expedienteId}/${up?.filename ?? fileToUpload.name}`,
        tipoMime: fileToUpload.type || up?.mime || 'application/octet-stream',
        tamanoBytes: fileToUpload.size ?? up?.size ?? 0,
        hashOpcional: '',
        subidoPor: user?.id || null,
      };

      await api.post('/adjuntos', payload);
      await dispatch(fetchAdjuntosThunk({ entidad: 'EXPEDIENTE', entidadId: expedienteId }));

      setFileToUpload(null);
      toast({ title: 'Adjunto subido y registrado', status: 'success' });
    } catch (e) {
      toast({ title: 'Error al subir/registrar adjunto', description: e?.message || String(e), status: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
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
            <FormControl>
              <FormLabel>Archivo</FormLabel>
              <Input type="file" onChange={onFileChange} />
            </FormControl>

            <HStack mt={3}>
              <Button onClick={handleUploadClick} isLoading={uploading} isDisabled={!fileToUpload}>
                Subir y registrar
              </Button>
            </HStack>

            {adjuntosState.loading ? <Spinner /> : adjuntos.length ? (
              <Table size="sm" variant="simple" mt={4}>
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
                          <IconButton aria-label="Eliminar" size="xs" icon={<DeleteIcon />} onClick={() => onDeleteAdj(a.id)} isDisabled={!a.id} />
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
    </>
  );
}