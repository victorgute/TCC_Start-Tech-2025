import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // A nova configuração de build para múltiplas páginas
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ferramentas: resolve(__dirname, 'html/ferramentas.html'),
        sobre: resolve(__dirname, 'html/sobre.html'),
        contato: resolve(__dirname, 'html/contato.html'),
        login: resolve(__dirname, 'html/login.html'),
        // Adicione aqui qualquer outra página .html que você tenha
        // Exemplo: politica: resolve(__dirname, 'html/politica.html'),
      }
    }
  },

  // A configuração do proxy que você já tinha (para o ambiente local)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});