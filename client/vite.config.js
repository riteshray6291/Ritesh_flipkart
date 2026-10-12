/* eslint-disable no-unused-vars */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    const serverUrl = (
        env.VITE_SERVER_URL || env.VITE_API || "http://localhost:8080"
    ).replace(/\/$/, "");

    return {
        plugins: [react()],
        // Keep all existing API call sites on the same backend URL, including
        // older code that reads VITE_SERVER_URL directly.
        define: {
            "import.meta.env.VITE_SERVER_URL": JSON.stringify(serverUrl),
        },
    };
});
