import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainBoard from './pages/MainBoard';
import TimeAuctionGame from './pages/TimeAuctionGame';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainBoard />} />
          <Route path="/time-auction" element={<TimeAuctionGame />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 