import { BrowserRouter } from 'react-router-dom';

import AppRoutes from './routes/AppRoutes.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { CurrentUserProvider } from './context/CurrentUserContext.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <CurrentUserProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CurrentUserProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
