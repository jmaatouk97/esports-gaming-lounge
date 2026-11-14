import { GlassSystemProvider } from "open-glass-ui";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";
import Overview from "./pages/Overview";
import Cafe from "./pages/Cafe";
import Stock from "./pages/Stock";
import Finance from "./pages/Finance";
import Members from "./pages/Members";
import Monitoring from "./pages/Monitoring";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { useThemePreset } from "./theme";

export default function App() {
  const { preset } = useThemePreset();
  const [accent, secondary, tertiary] = preset.colors;

  return (
    <GlassSystemProvider
      design="liquid"
      renderer="auto"
      theme={{
        appearance: "dark",
        defaultAppearance: "dark",
        theme: {
          accent,
          secondary,
          tertiary,
          contrast: "high",
          radius: "soft",
          glass: "frosted",
        },
      }}
    >
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Overview />} />
            <Route path="cafe" element={<Cafe />} />
            <Route path="stock" element={<Stock />} />
            <Route path="finance" element={<Finance />} />
            <Route path="members" element={<Members />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlassSystemProvider>
  );
}
