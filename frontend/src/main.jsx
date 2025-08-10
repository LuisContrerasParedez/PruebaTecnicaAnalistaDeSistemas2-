// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import Bootstrap from './Boostrap.jsx';

import App from './App.jsx';
import { store } from './app/store.js';
import { theme } from './theme.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <BrowserRouter>
          <Bootstrap>
            <App />
          </Bootstrap>
        </BrowserRouter>
      </ChakraProvider>
    </Provider>
  </React.StrictMode>
);
