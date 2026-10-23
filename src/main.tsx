import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { RobotStateProvider } from './context/RobotStateContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RobotStateProvider>
      <App />
    </RobotStateProvider>
  </StrictMode>,
);
