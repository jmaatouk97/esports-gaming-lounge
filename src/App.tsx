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
import Events from "./pages/Events";
import UIShowcase from "./pages/UIShowcase";
import { useThemePreset } from "./theme";

export default function App() {
  const { preset, mode, optics } = useThemePreset();
  const [accent, secondary, tertiary] = preset.colors;

  return (
    <GlassSystemProvider
      design="liquid"
      renderer="auto"
      theme={{
        appearance: mode,
        defaultAppearance: mode,
        theme: {
          accent,
          secondary,
          tertiary,
          contrast: "high",
          radius: "soft",
          glass: {
            blur: 0.55 + (optics.blur / 100) * 0.9,
            opacity: 0.4 + (optics.strength / 100) * 0.9,
            rim: 0.5 + (optics.bezel / 100) * 0.9,
            highlight: 0.4 + (optics.specular / 100) * 1.1,
            saturation: 1 + (optics.frost / 100) * 0.5,
            brightness: mode === "light" ? 1.04 : 0.95,
          },
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
            <Route path="events" element={<Events />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="ui-showcase" element={<UIShowcase />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GlassSystemProvider>
  );
}
