import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import HomePage from "./pages/HomePage";
import ParkingAreaDetailPage from "./pages/ParkingAreaDetailPage";
import DataAnnotatorPage from "./pages/DataAnnotatorPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/areas/:areaId" element={<ParkingAreaDetailPage />} />
          <Route path="/annotator" element={<DataAnnotatorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}