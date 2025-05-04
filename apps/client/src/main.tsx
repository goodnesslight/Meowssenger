import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './modules/app/app';
import * as ReactDOM from 'react-dom/client';
import './helpers/socket/socket';
import './helpers/i18n/i18n';

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
