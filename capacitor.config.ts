import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.koloquest.kids',
  appName: 'Kolo Quest Kids',
  webDir: 'dist',
  android: {
    // Allow cleartext for localhost dev only — prod uses HTTPS
    allowMixedContent: false,
  },
  server: {
    // On device, load from the bundled dist/ assets (no live-reload URL)
    // Uncomment below only for local development:
    // url: 'http://192.168.1.x:5173',
    // cleartext: true,
  },
};

export default config;
