import './App.css'
import { HashRouter, Route, Routes } from 'react-router-dom';
import BookRanker from './BookRanker';
import LoginPage from './LoginPage';
import ResultsPage from './ResultsPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<BookRanker />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App