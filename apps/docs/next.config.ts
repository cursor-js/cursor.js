import type { NextConfig } from 'next';
import { createMDX } from 'fumadocs-mdx/next';
import fs from 'fs';
import path from 'path';

// Check if the pro package is cloned locally (Submodule logic).
const hasPro = fs.existsSync(path.resolve(process.cwd(), '../../packages/pro/package.json'));

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

if (!hasPro) {
  // Fallback for Turbopack (Next.js 15+ default dev server)
  nextConfig.turbopack = {
    resolveAlias: {
      '@cursor.js/pro': path.resolve(process.cwd(), 'src/lib/pro-mock.ts'),
    },
  };

  // Fallback for Webpack (Production build 'next build')
  nextConfig.webpack = (config) => {
    config.resolve.alias['@cursor.js/pro'] = path.resolve(process.cwd(), 'src/lib/pro-mock.ts');
    return config;
  };
}

const withMDX = createMDX({});

export default withMDX(nextConfig);
