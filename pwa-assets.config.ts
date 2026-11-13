import {
  defineConfig,
  minimal2023Preset,
} from "@vite-pwa/assets-generator/config"

// npx pwa-assets-generator : app icons from public/app-icon.svg.
export default defineConfig({
  preset: minimal2023Preset,
  images: ["public/app-icon.svg"],
})
