// src/theme.js
import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const fontsStack =
  `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif`;

const styles = {
  global: ({ colorMode }) => ({
    'html, body, #root': { height: '100%' },
    body: {
      bg: colorMode === 'light' ? '#fbfbfd' : '#0b0b0d', 
      color: colorMode === 'light' ? '#0b0b0d' : '#f5f5f7',
      letterSpacing: '-0.01em',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    }
  }),
};

const components = {
  Button: {
    baseStyle: { borderRadius: 'xl', fontWeight: 600 },
    variants: {
      soft: ({ colorMode }) => ({
        bg: colorMode === 'light' ? '#007aff' : '#0a84ff',
        color: 'white',
        _hover: { filter: 'brightness(1.05)' },
        _active: { filter: 'brightness(0.97)' },
        shadow: '0 6px 18px rgba(0,122,255,0.35)',
      }),
      glass: ({ colorMode }) => ({
        bg: colorMode === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.06)',
        backdropFilter: 'saturate(180%) blur(16px)',
        border: '1px solid',
        borderColor: colorMode === 'light' ? 'blackAlpha.200' : 'whiteAlpha.200',
        _hover: { bg: colorMode === 'light' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.1)' },
      }),
    },
    defaultProps: { variant: 'soft' },
  },
  Input: {
    baseStyle: { field: { borderRadius: 'lg' } },
    variants: {
      filled: ({ colorMode }) => ({
        field: {
          bg: colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.100',
          _hover: { bg: colorMode === 'light' ? 'blackAlpha.100' : 'whiteAlpha.200' },
          _focus: {
            bg: colorMode === 'light' ? 'white' : 'whiteAlpha.200',
            borderColor: '#0a84ff',
            boxShadow: '0 0 0 3px rgba(10,132,255,0.35)',
          },
        }
      }),
    },
    defaultProps: { variant: 'filled' },
  },
  FormLabel: { baseStyle: { fontWeight: 600 } },
  Card: {
    baseStyle: {
      container: {
        borderRadius: '2xl',
        borderWidth: '1px',
        borderColor: 'blackAlpha.200',
        bg: 'rgba(255,255,255,0.7)',
        _dark: {
          borderColor: 'whiteAlpha.200',
          bg: 'rgba(255,255,255,0.06)',
        },
        backdropFilter: 'saturate(180%) blur(18px)',
      }
    }
  }
};

export const theme = extendTheme({
  config,
  fonts: { heading: fontsStack, body: fontsStack },
  styles,
  components,
  radii: { xl: '16px', '2xl': '22px' },
  shadows: {
    subtle: '0 10px 30px rgba(0,0,0,0.06)',
  },
});
