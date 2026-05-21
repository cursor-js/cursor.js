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
        url: '/docs',
        active: 'nested-url',
      },
      {
        text: 'React UI',
        url: '/docs/ui',
        active: 'nested-url',
      },
      {
        text: 'Pro',
        url: '/pro',
        active: 'nested-url',
      },
      {
        text: 'Create',
        url: '/create',
        active: 'nested-url',
      },
    ],
  };
}
