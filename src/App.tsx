import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BookRanker from './BookRanker';
import LoginPage from './LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookRanker />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
