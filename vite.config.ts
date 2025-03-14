import { defineConfig } from 'vite';
import webExtension from 'vite-plugin-web-extension';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const manifestJson: chrome.runtime.Manifest = JSON.parse(
  readFileSync(resolve(__dirname, 'manifest.json'), 'utf-8')
);

export default defineConfig({
  plugins: [
    webExtension({
      manifest: () => manifestJson,
    }),
  ],
});
