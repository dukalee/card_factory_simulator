import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' → 어떤 하위 경로에 배포해도 동작
export default defineConfig({
  base: './',
  plugins: [react()],
});
