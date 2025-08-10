import { Box, Container, useColorModeValue } from '@chakra-ui/react';

export default function AuthShell({ children }) {
  const gradient = useColorModeValue(
    'radial(1200px 600px at -10% -10%, #e8f0ff 0%, transparent 40%), radial(900px 600px at 110% 10%, #ffe8f0 0%, transparent 42%), linear(180deg, #fbfbfd 0%, #fbfbfd 100%)',
    'radial(1000px 600px at -10% -10%, rgba(10,132,255,0.08) 0%, transparent 40%), radial(900px 600px at 110% 10%, rgba(255,55,95,0.12) 0%, transparent 42%), linear(180deg, #0b0b0d 0%, #0b0b0d 100%)'
  );

  return (
    <Box minH="100dvh" bgImage={gradient}>
      <Container maxW="lg" py={{ base: 10, md: 16 }}>
        {children}
      </Container>
    </Box>
  );
}
