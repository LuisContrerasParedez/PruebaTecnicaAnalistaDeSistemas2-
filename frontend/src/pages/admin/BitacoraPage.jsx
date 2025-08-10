import { useEffect, useState } from 'react';
import {
  Box, HStack, Input, Button, Table, Thead, Tr, Th, Tbody, Td, Select
} from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectBitacora } from '../../app/store';
import { listBitacora } from '../../features/bitacora/bitacoraSlice';

export default function BitacoraPage() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector(selectBitacora);
  const [q, setQ] = useState('');
  const [entidad, setEntidad] = useState('');

  const onSearch = () => dispatch(listBitacora({ q, entidad, page:1, pageSize:50 }));

  useEffect(()=>{ onSearch(); }, []); // eslint-disable-line

  return (
    <Box>
      <HStack mb={4} gap={3}>
        <Input placeholder="Buscar por acción/detalle" value={q} onChange={e=>setQ(e.target.value)} />
        <Select placeholder="Entidad" value={entidad} onChange={e=>setEntidad(e.target.value)}>
          <option value="USUARIO">USUARIO</option>
          <option value="EXPEDIENTE">EXPEDIENTE</option>
          <option value="INDICIO">INDICIO</option>
          <option value="ADJUNTO">ADJUNTO</option>
          <option value="DECISION">DECISION</option>
        </Select>
        <Button onClick={onSearch} isLoading={loading}>Filtrar</Button>
      </HStack>

      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Fecha</Th>
            <Th>Usuario</Th>
            <Th>Acción</Th>
            <Th>Entidad</Th>
            <Th>ID</Th>
            <Th>Detalle</Th>
            <Th>IP</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map(b => (
            <Tr key={b.CodigoBitacora}>
              <Td>{new Date(b.creado_en).toLocaleString()}</Td>
              <Td>{b.usuario_nombre || b.CodigoUsuario}</Td>
              <Td>{b.accion}</Td>
              <Td>{b.entidad}</Td>
              <Td>{b.entidad_id}</Td>
              <Td maxW="520px" whiteSpace="pre-wrap">{b.detalle_json || '-'}</Td>
              <Td>{b.ip || '-'}</Td>
            </Tr>
          ))}
          {items.length === 0 && (
            <Tr><Td colSpan={7} textAlign="center" py={8}>Sin registros</Td></Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
