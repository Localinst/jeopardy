import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

// Ottiene il percorso della directory del file corrente
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carica le variabili d'ambiente dal file .env
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  // Assicura che i valori siano disponibili come stringhe
  const envWithStringValues = Object.fromEntries(
    Object.entries(env).map(([key, value]) => [key, value ?? ''])
  );
  
  console.log('Variabili d\'ambiente caricate:', envWithStringValues);
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    envDir: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Rende disponibili tutte le variabili d'ambiente che iniziano con VITE_
      ...Object.keys(env).reduce((acc: Record<string, string>, key: string) => {
        acc[`import.meta.env.${key}`] = JSON.stringify(env[key]);
        return acc;
      }, {}),
      // Aggiungi esplicitamente la chiave OPENROUTER
      'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(env.VITE_OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || '')
    }
  };
});
