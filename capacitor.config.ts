import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.koloquest.kids',
  appName: 'Kolo Quest Kids',
  webDir: 'dist',
  android: {
    // Allow cleartext for localhost dev only — prod uses HTTPS
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#7026DC',  // matches gradient top color
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#7026DC',
    },
  },
  server: {
    // On device, load from the bundled dist/ assets (no live-reload URL)
    // Uncomment below only for local development:
    // url: 'http://192.168.1.x:5173',
    // cleartext: true,
  },
};

export default config;
