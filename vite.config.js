import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { host: true },
  // Railway va boshqa hostinglarda "Blocked request" xatosi chiqmasligi uchun
  preview: { host: true, allowedHosts: true },
});
