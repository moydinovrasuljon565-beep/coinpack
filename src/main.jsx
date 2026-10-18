import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { ls } from "./lib/storage.js";
import "./styles.css";

document.documentElement.dataset.theme = ls.get("theme", "light");

createRoot(document.getElementById("root")).render(<App />);
