import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "VITE_");
    const serverUrl = (
        env.VITE_SERVER_URL || env.VITE_API || "http://localhost:8080"
    ).replace(/\/$/, "");
    if (mode === "production" && ((!env.VITE_SERVER_URL && !env.VITE_API) || serverUrl.includes("localhost"))) {
        throw new Error("Set VITE_SERVER_URL to the deployed API origin before creating a production build.");
    }

    return {
        plugins: [react()],
        // Keep all existing API call sites on the same backend URL, including
        // older code that reads VITE_SERVER_URL directly.
        define: {
            "import.meta.env.VITE_SERVER_URL": JSON.stringify(serverUrl),
        },
    };
});
