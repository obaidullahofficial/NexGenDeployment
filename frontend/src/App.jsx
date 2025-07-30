import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import SubAdminDashboard from './pages/SubAdminDashboard';
import PlotDetail from './pages/PlotDetail';
import SocietiesPage from './pages/SocietiesPage';
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Homepage route (default route when app starts) */}
        <Route path="/" element={<HomePage />} />
        
        
        {/* Login route */}
        <Route 
          path="/login" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-[#2F3D57] bg-cover bg-center bg-no-repeat bg-blend-overlay">
            <Login />
          </div>
          } 
        />
        
        {/* Sub-admin route */}
        <Route path="/sub-admin" element={<SubAdminDashboard />} />
        <Route path="/society" element={<SocietiesPage />} />
        
        {/* plot-detail route */}
        <Route path="/plot-detail" element={<PlotDetail />} />
        {/* You can add more routes here as needed */}
        
      </Routes>
    </Router>
  );
};

export default App;