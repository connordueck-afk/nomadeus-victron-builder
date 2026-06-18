import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/nomadeus-victron-builder/",
  plugins: [react()],
});
