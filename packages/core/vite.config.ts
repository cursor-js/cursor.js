import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(process.cwd(), 'src/index.ts'),
      name: 'Cursor',
      fileName: 'cursor',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // By default Vite handles bundle of all code. If you want any external dependencies, list them here.
      external: [],
      output: {
        globals: {},
      },
    },
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.json',
      exclude: ['src/**/*.test.ts'],
    }),
  ],
});
