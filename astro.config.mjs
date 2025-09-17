import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://gh-ops.vemi.jp',
  integrations: [
    starlight({
      title: 'GitHub Organizational Operations & Principles Guide',
      sidebar: [
        {
          label: '原則（Bible）',
          autogenerate: { 
            directory: 'bible',
            collapsed: false,
          },
        },
        {
          label: '運用（Framework）',
          autogenerate: { 
            directory: 'framework',
            collapsed: false,
          },
        },
      ],
      locales: {
        root: { 
          label: '日本語', 
          lang: 'ja',
          dir: 'ltr',
        },
        en: { 
          label: 'English', 
          lang: 'en',
          dir: 'ltr',
        },
      },
      defaultLocale: 'root',
    }),
  ],
});
