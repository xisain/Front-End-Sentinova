import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Flow from "./pages/flow";
import DashboardContent from "./pages/flow/DashboardContent";
import AnalysisContent from "./pages/flow/AnalysisContent";
import AnalysisResults from "./pages/flow/AnalysisResults";
import HistoryContent from "./pages/flow/HistoryContent";
import ReportsContent from "./pages/flow/ReportsContent";
import SettingsContent from "./pages/flow/SettingsContent";
import './App.css';
import './index.css';
import { SignIn, SignUp, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import Auth from "./pages/auth";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      {/* Nested route for /flow */}
      <Route path="/flow" element={<Flow />}>
        <Route index element={<DashboardContent />} />
        <Route path="analysis" element={<AnalysisContent />} />
        <Route path="analysis/results" element={<AnalysisResults />} />
        <Route path="history" element={<HistoryContent />} />
        <Route path="reports" element={<ReportsContent />} />
        <Route path="settings" element={<SettingsContent />} />
      </Route>
    </Routes>
  );
}

export default App;
