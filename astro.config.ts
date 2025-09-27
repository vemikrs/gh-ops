import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// SidebarItems (Menu)
const sidebar = [
  // Welcome page
  { label: 'はじめに (Introduction)', link: '/', },
  
  // 1. Framework (主体) - 実践的な運用ガイド
  {
    label: 'ガイドライン (Guidelines) - Practical Guides',
    autogenerate: {
      directory: 'guidelines',
      collapsed: false,
    },
  },
  
  // 2. Bible (参照用) - 迷子になった時の道標
  {
    label: '基本原則 (Bible) - Principles',

    autogenerate: {
      directory: 'bible',
      collapsed: true, // デフォルトで折りたたみ
    },
  },
  
  // 3. Appendix (将来用)
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

    }),
  ],
});
