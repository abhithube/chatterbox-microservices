import { ColorModeScript } from '@chakra-ui/react';
import { StrictMode } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { App } from './app/App';
import { store } from './app/store';

render(
  <StrictMode>
    <ColorModeScript />
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
  document.getElementById('root')
);
