import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  base: '/',
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    'import.meta.env.VITE_ADMIN_USERNAME': JSON.stringify(process.env.VITE_ADMIN_USERNAME),
    'import.meta.env.VITE_ADMIN_PASSWORD': JSON.stringify(process.env.VITE_ADMIN_PASSWORD)
  }
}));