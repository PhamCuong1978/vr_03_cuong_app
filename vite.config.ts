import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    // Nếu build với mode=production (Vercel) thì base="/"
    // Nếu build với mode=gh (GitHub Pages) thì base="/vr_03_cuong_app/"
    base: mode === 'gh' ? '/vr_03_cuong_app/' : '/',
    plugins: [react()],
    define: {
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
