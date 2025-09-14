import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Configuração de build para múltiplas páginas
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ferramentas: resolve(__dirname, 'html/ferramentas.html'),
        esg: resolve(__dirname, 'html/esg-e-metas.html'),
        sobre: resolve(__dirname, 'html/sobre.html'),
        contato: resolve(__dirname, 'html/contato.html'),
        login: resolve(__dirname, 'html/login.html'),
        signup: resolve(__dirname, 'html/signup.html'),
        login: resolve(__dirname, 'html/login.html'),
        profile: resolve(__dirname, 'html/profile.html'),
        profile: resolve(__dirname, 'html/profile.html'),
        politica: resolve(__dirname, 'html/politica.html'),
        termos: resolve(__dirname, 'html/termos.html'),
        lgpd: resolve(__dirname, 'html/lgpd.html'),
      }
    }
  },

  // Proxy para o ambiente de desenvolvimento local
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});