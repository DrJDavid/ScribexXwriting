import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./globals.css";

// The providers are now set up in the App component
createRoot(document.getElementById("root")!).render(<App />);
