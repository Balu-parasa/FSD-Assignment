import type { NextConfig } from 'next';
const config: NextConfig = {
  output: process.platform === 'win32' ? undefined : 'standalone',
};
export default config;
