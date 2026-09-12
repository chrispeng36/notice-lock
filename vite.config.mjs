import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 渲染层根目录
  root: 'renderer',
  // 关键：构建产物用相对路径，打包成 Electron 后通过 file:// 也能正常加载资源
  base: './',
  plugins: [react()],
  build: {
    outDir: '../dist/renderer',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
