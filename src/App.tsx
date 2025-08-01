import './App.css'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import BookRanker from './BookRanker';
import LoginPage from './LoginPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<BookRanker />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App