import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'GitHub Organizational Operations & Principles Guide',
      sidebar: [
        {
          label: '原則（Bible）',
          items: [
            { label: '概要', link: '/bible/overview' },
          ],
        },
        {
          label: '運用（Framework）',
          items: [
            { label: '最小運用', link: '/framework/org-team-minimal' },
            { label: 'Copilotの安全な段階導入', link: '/framework/copilot-safe-rollout' },
          ],
        },
      ],
      locales: {
        root: { label: '日本語', lang: 'ja' },
        en: { label: 'English', lang: 'en' }
      }
    }),
  ],
});
