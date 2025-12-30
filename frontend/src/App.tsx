import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { ToastProvider } from './components/Toast';
import { IntroProvider } from './context/IntroContext';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <IntroProvider>
          <AppRoutes />
        </IntroProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
