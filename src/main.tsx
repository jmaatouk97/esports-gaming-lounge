import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import { ThemeController } from "./theme";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeController>
      <App />
    </ThemeController>
  </StrictMode>,
);
