import React from 'react';
import {
    CardHeader, CardBody, Heading, VStack, Text, HStack, Button,
    Table, Thead, Tbody, Tr, Th, Td, IconButton, Spinner
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, InfoOutlineIcon } from '@chakra-ui/icons';

export default function IndiciosSection({
    expedienteId,
    puedeEditar,
    indicios,
    indiciosLoading,
    onAdd,
    onEdit,
    onDelete,
}) {
    const actionsWidth = { base: '88px', md: '96px' }; // evita colapso

    return (
        <>
            <CardHeader pb={2}>
                <HStack justify="space-between" align="center">
                    <Heading size="sm">Indicios del expediente</Heading>
                    {puedeEditar && (
                        <Button size="sm" leftIcon={<AddIcon />} onClick={onAdd} isDisabled={!expedienteId}>
                            Agregar
                        </Button>
                    )}
                </HStack>
            </CardHeader>

            <CardBody pt={0}>
                {!expedienteId ? (
                    <VStack py={6} color="gray.500">
                        <InfoOutlineIcon />
                        <Text fontSize="sm">Guarda el expediente para poder registrar indicios</Text>
                    </VStack>
                ) : indiciosLoading ? (
                    <Spinner />
                ) : indicios?.length ? (
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
                                {/* 👇 fuerza ancho y evita que desaparezca */}
                                <Th textAlign="right" w={actionsWidth} minW={actionsWidth} whiteSpace="nowrap">
                                    Acciones
                                </Th>
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

                                    <Td textAlign="right" w="96px" minW="96px" whiteSpace="nowrap">
                                        <HStack justify="flex-end" spacing={1}>
                                            <IconButton size="xs" variant="ghost" aria-label="Editar" onClick={() => onEdit(r)} isDisabled={!puedeEditar} icon={<EditIcon />} />
                                            <IconButton size="xs" variant="ghost" aria-label="Eliminar" onClick={() => onDelete(r.id)} isDisabled={!puedeEditar || !r.id} icon={<DeleteIcon />} />
                                        </HStack>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                ) : (
                    <VStack py={6} color="gray.500">
                        <InfoOutlineIcon />
                        <Text fontSize="sm">No hay indicios</Text>
                    </VStack>
                )}
            </CardBody>
        </>
    );
}
