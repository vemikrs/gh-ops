import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// SidebarItems (Menu)
const sidebar = [
  // 0. Welcome page
  { label: 'Introduction', link: '/', },

  // 1. Guidelines - 実践的な運用ガイド
  {
    label: 'Guidelines',
    // 役割ごとにサブグループを分けてラベルを明示
    items: [
      { label: "Workflows", autogenerate: { directory: 'guidelines/workflows', collapsed: false } },
      { label: 'Enterprise Admin', autogenerate: { directory: 'guidelines/enterprise-admin', collapsed: true } },
      { label: 'Org Admin', autogenerate: { directory: 'guidelines/org-admin', collapsed: true } },
      { label: 'Repo / Project Maintainer', autogenerate: { directory: 'guidelines/repo-project', collapsed: true } },
      { label: 'Developer', autogenerate: { directory: 'guidelines/developer', collapsed: true } },
      { label: 'User / Accessor', autogenerate: { directory: 'guidelines/user-access', collapsed: true } },
    ],
  },

  // 2. Evolution（アーカイブ）
  {
    label: 'Evolution Archive',
    autogenerate: {
      directory: 'evolution',
      collapsed: true,
    },
  },

  // 3. Bible (参照用) - 迷子になった時の道標
  {
    label: 'Bible - Principles',
    autogenerate: {
      directory: 'bible',
      collapsed: true, // デフォルトで折りたたみ
    },
  },
];

// Locales
const locales = {
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
} as any;

export default defineConfig({
  site: 'https://gh-ops.vemi.jp',
  integrations: [
    starlight({
      title: 'GH-OPS Guide',
      description: 'GitHub Organizational Operations & Principles Guide.',
      //      logo: { src: '/logo.svg', alt: 'GH-Ops Logo', href: '/', width: 48, height: 48 },
      editLink: {
        baseUrl: 'https://github.com/vemikrs/gh-ops/edit/main',
      },
      sidebar,
      locales,
      defaultLocale: 'root',
      customCss: [
        '/src/styles/tokens.css',
        '/src/styles/theme.light.css',
        '/src/styles/theme.dark.css',
        '/src/styles/custom.css',
        // '/src/styles/mermaid.css', // 図の見た目調整が必要になったら有効化
      ],
      components: {
        ThemeSelect: './src/components/overrides/ThemeSelect.astro',
        LanguageSelect: './src/components/overrides/LanguageSelect.astro',
      },

    }),
  ],
});
