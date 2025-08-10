import React from 'react';
import { Card, useColorModeValue } from '@chakra-ui/react';

export default function Glass(props) {
  const bg = useColorModeValue('rgba(255,255,255,0.82)', 'rgba(255,255,255,0.06)');
  const border = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  return (
    <Card bg={bg} backdropFilter="saturate(180%) blur(14px)" border="1px solid" borderColor={border} shadow="sm" {...props} />
  );
}