import type { NextConfig } from 'next';
import { createMDX } from 'fumadocs-mdx/next';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const appDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDirectory, '../..');
const proPackagePath = path.join(repoRoot, 'packages/pro/package.json');
const proMockPath = path.join(appDirectory, 'src/lib/pro-mock.ts');

// Check if the pro package is cloned locally (Submodule logic).
const hasPro = fs.existsSync(proPackagePath);

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/voices/:path*',
        destination: 'https://thagcvsquukldham.public.blob.vercel-storage.com/tts/:path*',
      },
    ];
  },
};

if (!hasPro) {
  // Fallback for Turbopack (Next.js 15+ default dev server)
  nextConfig.turbopack = {
    resolveAlias: {
      '@cursor.js/pro': proMockPath,
      '@cursor.js/pro/cursors': proMockPath,
    },
  };

  // Fallback for Webpack (Production build 'next build')
  nextConfig.webpack = (config) => {
    config.resolve.alias['@cursor.js/pro'] = proMockPath;
    config.resolve.alias['@cursor.js/pro/cursors'] = proMockPath;
    return config;
  };
}

const withMDX = createMDX({});

export default withMDX(nextConfig);
