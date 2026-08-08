import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig(({ command }) => ({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    // Nitro's SSR env often 503s on Windows cold starts (known upstream race).
    // Keep it for production builds; TanStack Start handles local `vite dev`.
    ...(command === 'build' ? [nitro()] : []),
    viteReact(),
  ],
}))
