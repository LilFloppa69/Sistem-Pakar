import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            '/api-uci': {
                target: 'https://archive.ics.uci.edu',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api-uci/, ''),
            },
        },
    },
});
