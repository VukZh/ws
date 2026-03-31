import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default ({mode}: {mode: string}) => {
  const env = loadEnv(mode, process.cwd(), '')
  return defineConfig({
    plugins: [tailwindcss(), react()],
    define: {
      'process.env': env
    }
  })
}
