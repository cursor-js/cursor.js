import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'cursor.js',
    },
    githubUrl: 'https://github.com/cursor-js/cursor.js',
    links: [
      {
        text: 'Docs',
        url: '/docs/core-api/cursor',
        active: 'nested-url',
      },
    ],
  };
}
