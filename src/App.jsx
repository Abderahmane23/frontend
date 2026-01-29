// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import BestsellerDetail from './pages/BestsellerDetail';
import EngineDetails from './pages/EngineDetails';
import CameraScan from './pages/CameraScan';
import Notifications from './pages/Notifications';
import Maps from './pages/Maps';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import BottomNavbar from './components/BottomNavbar';
import Purchases from './pages/Purchases';
import { CartProvider } from './context/CartContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="app-shell">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/bestseller/:id" element={<BestsellerDetail />} />
            <Route path="/engine/:id" element={<EngineDetails />} />
            <Route path="/scan" element={<CameraScan />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/purchases" element={<Purchases />} />
          </Routes>
          <BottomNavbar />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
