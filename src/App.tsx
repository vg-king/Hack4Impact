import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AIAssistant from './pages/AIAssistant'
import FileAnalyzer from './pages/FileAnalyzer'
import FindDoctors from './pages/FindDoctors'
import PharmacyFinder from './pages/PharmacyFinder'
import DietPlans from './pages/DietPlans'
import EmergencySOS from './pages/EmergencySOS'
import HospitalOps from './pages/HospitalOPS'
import MentalHealth from './pages/MentalHealth'
import PredictiveRisk from './pages/PredictiveRisk'
import GenomicIntelligence from './pages/GenomicIntelligence'
import IoTWearables from './pages/IoTWearables'
import BlockchainEHR from './pages/BlockchainEHR'
import DrugInteractions from './pages/DrugInteractions'
import PrescriptionOCR from './pages/PrescriptionOCR'
import CVDiseaseDetection from './pages/CVDiseaseDetection'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/file-analyzer" element={<FileAnalyzer />} />
          <Route path="/find-doctors" element={<FindDoctors />} />
          <Route path="/pharmacy" element={<PharmacyFinder />} />
          <Route path="/diet" element={<DietPlans />} />
          <Route path="/emergency" element={<EmergencySOS />} />
          <Route path="/hospital-ops" element={<HospitalOps />} />
          <Route path="/mental-health" element={<MentalHealth />} />
          <Route path="/predictive-risk" element={<PredictiveRisk />} />
          <Route path="/genomics" element={<GenomicIntelligence />} />
          <Route path="/iot-wearables" element={<IoTWearables />} />
          <Route path="/blockchain-ehr" element={<BlockchainEHR />} />
          <Route path="/drug-interactions" element={<DrugInteractions />} />
          <Route path="/prescription-ocr" element={<PrescriptionOCR />} />
          <Route path="/cv-detection" element={<CVDiseaseDetection />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
