import { useState } from 'react';
import MapPane from './MapPane';
import Sidebar from './Sidebar';
import './App.css';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="app-container">
      {!isSidebarOpen && (
          <button className="toggle-btn-floating" onClick={toggleSidebar}>
            ☰ Menu
          </button>
      )}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <MapPane />
    </div>
  );
}