import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import './styles/theme.css';
import './styles/global.css';
import './styles/components/buttons.css';
import './styles/components/forms.css';
import './styles/components/cards.css';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
