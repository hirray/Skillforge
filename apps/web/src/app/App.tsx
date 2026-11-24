import { BrowserRouter } from 'react-router-dom';
import { ContextProvider } from '../context/ContextModel';
import { TourProvider } from '../components/tour/TourProvider';
import Member2Workspace from '../modules/ai/Workspace';

const App = () => {
  return (
    <BrowserRouter>
      <ContextProvider>
        <TourProvider>
          <Member2Workspace />
        </TourProvider>
      </ContextProvider>
    </BrowserRouter>
  );
};

export default App;
