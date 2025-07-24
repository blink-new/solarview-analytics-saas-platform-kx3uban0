import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { InverterDetails } from '@/components/inverters/InverterDetails';
import { InverterManagement } from '@/components/inverters/InverterManagement';
import { DataImport } from '@/components/import/DataImport';
import { DataExport } from '@/components/export/DataExport';
import { CostCalculator } from '@/components/calculator/CostCalculator';
import { ReportsGenerator } from '@/components/reports/ReportsGenerator';
import { Settings } from '@/components/settings/Settings';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedInverterId, setSelectedInverterId] = useState<string | null>(null);

  const handleInverterSelect = (inverterId: string) => {
    setSelectedInverterId(inverterId);
    setCurrentPage('inverter-details');
  };

  const handleBackToDashboard = () => {
    setSelectedInverterId(null);
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onInverterSelect={handleInverterSelect} />;
      case 'inverter-details':
        return selectedInverterId ? (
          <InverterDetails 
            inverterId={selectedInverterId} 
            onBack={handleBackToDashboard}
          />
        ) : <Dashboard onInverterSelect={handleInverterSelect} />;
      case 'inverters':
        return <InverterManagement />;
      case 'import':
        return <DataImport />;
      case 'export':
        return <DataExport />;
      case 'calculator':
        return <CostCalculator />;
      case 'reports':
        return <ReportsGenerator />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onInverterSelect={handleInverterSelect} />;
    }
  };

  return (
    <>
      <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </AppLayout>
      <Toaster />
    </>
  );
}

export default App;