import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/aquapi_ai/' : '/',
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  define: {
    'process.env.VITE_API_KEY': JSON.stringify(process.env.VITE_API_KEY)
  }
}));
