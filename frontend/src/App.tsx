import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { PredictChurn } from './pages/PredictChurn';
import { CustomerExplorer } from './pages/CustomerExplorer';
import { ModelPerformance } from './pages/ModelPerformance';
import { ChurnDrivers } from './pages/ChurnDrivers';
import { BusinessImpact } from './pages/BusinessImpact';
import { About } from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/predict"   element={<PredictChurn />} />
          <Route path="/customers" element={<CustomerExplorer />} />
          <Route path="/model"     element={<ModelPerformance />} />
          <Route path="/drivers"   element={<ChurnDrivers />} />
          <Route path="/business"  element={<BusinessImpact />} />
          <Route path="/about"     element={<About />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
