import { BrowserRouter } from 'react-router-dom';
import { ContextProvider } from '../context/ContextModel';
import Member2Workspace from '../modules/ai/Workspace';

const App = () => {
  return (
    <BrowserRouter>
      <ContextProvider>
        <Member2Workspace />
      </ContextProvider>
    </BrowserRouter>
  );
};

export default App;
