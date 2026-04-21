import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const muscleHighlighter = path.resolve(
  __dirname,
  'vendor/react-muscle-highlighter/dist/esm/index.js',
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Explicit entry avoids flaky resolution if installs are partial (Windows / CI).
      'react-muscle-highlighter': muscleHighlighter,
    },
  },
})
