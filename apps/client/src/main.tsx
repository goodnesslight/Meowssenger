import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './app/app';
import * as ReactDOM from 'react-dom/client';
import './socket/socket';
import './i18n/i18n';

const root: ReactDOM.Root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
