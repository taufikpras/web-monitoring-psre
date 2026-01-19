import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { DataList } from './pages/DataList';
import { UploadPage } from './pages/UploadPage';
import { TicketsPage } from './pages/TicketsPage';
import { FilesPage } from './pages/FilesPage';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
        <Sidebar />
        <main style={{
          marginLeft: '260px',
          flex: 1,
          padding: '2rem',
          maxWidth: 'calc(100vw - 260px)'
        }}>
          <div className="container" style={{ maxWidth: '1400px' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/data" element={<DataList />} />
              <Route path="/files" element={<FilesPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
