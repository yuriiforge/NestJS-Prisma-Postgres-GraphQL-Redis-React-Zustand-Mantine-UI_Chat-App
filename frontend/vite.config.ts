import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // The trick: Redirect the broken package to your local dummy file
      '@graphql-typed-document-node/core': path.resolve(
        __dirname,
        './src/mock-typed-document-node.js'
      ),
    },
  },
});
