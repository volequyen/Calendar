import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Kích hoạt JSX trong file .js
      include: "**/*.{jsx,js}",
    }),
    tailwindcss(),
  ],
  resolve: {
    extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"],
  },
});
