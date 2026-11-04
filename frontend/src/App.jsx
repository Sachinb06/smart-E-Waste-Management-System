import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import DetectionPage from './pages/DetectionPage';
import CollectionRequestPage from './pages/CollectionRequestPage';
import TrackRequestPage from './pages/TrackRequestPage';
import CentersLocatorPage from './pages/CentersLocatorPage';
import IoTDashboardPage from './pages/IoTDashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [pendingRequestPrefill, setPendingRequestPrefill] = useState(null);
  const [selectedTrackingCode, setSelectedTrackingCode] = useState('');

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return (
          <HomePage 
            setActivePage={setActivePage} 
            onStartDetection={() => setActivePage('detect')} 
          />
        );
      case 'detect':
        return (
          <DetectionPage 
            setActivePage={setActivePage} 
            setPendingRequestPrefill={setPendingRequestPrefill} 
          />
        );
      case 'request':
        return (
          <CollectionRequestPage 
            prefillData={pendingRequestPrefill}
            setActivePage={setActivePage}
            setSelectedTrackingCode={setSelectedTrackingCode}
          />
        );
      case 'track':
        return (
          <TrackRequestPage 
            selectedTrackingCode={selectedTrackingCode}
            setSelectedTrackingCode={setSelectedTrackingCode}
          />
        );
      case 'centers':
        return <CentersLocatorPage />;
      case 'iot':
        return <IoTDashboardPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'dashboard':
        return (
          <UserDashboardPage 
            setActivePage={setActivePage}
            setSelectedTrackingCode={setSelectedTrackingCode}
          />
        );
      case 'admin':
        return (
          <AdminDashboardPage 
            setActivePage={setActivePage}
            setSelectedTrackingCode={setSelectedTrackingCode}
          />
        );
      case 'login':
        return <LoginPage setActivePage={setActivePage} />;
      case 'register':
        return <RegisterPage setActivePage={setActivePage} />;
      default:
        return <HomePage setActivePage={setActivePage} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
        <Navbar activePage={activePage} setActivePage={setActivePage} />
        
        <main className="flex-1">
          {renderActivePage()}
        </main>

        <Footer setActivePage={setActivePage} />
      </div>
    </AuthProvider>
  );
}
