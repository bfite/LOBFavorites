import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/lobfavorites/', // ← must match repo name
  plugins: [react()],
});
