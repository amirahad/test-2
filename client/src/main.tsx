import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add page title
document.title = "Belle Property Sales Dashboard";

createRoot(document.getElementById("root")!).render(<App />);
