# Copilot Instructions for GH-OPS Guide

この文書は GH-OPS Guide の執筆・実装・検証に関わる開発者/レビュア向けガイドラインです。  
すべての規範表現は **RFC 2119** に準拠します。

---

## 用語の強度レベル

- **MUST**: 絶対に守らなければならない
- **MUST NOT**: 絶対に行ってはならない
- **SHOULD**: 強く推奨。合理的理由があれば例外可（必ず記録）
- **MAY**: 任意

---

## 本ガイドの目的（Scope）

- Docs（Starlight+Astro）と UI（ヘッダーセレクタ等）の仕様を、PC/モバイル双方で信頼できる自動テストと証跡で継続的に保証する。
- ガイドライン文書は「役割 × トピック」で構成し、各ページは自完結（他文書非依存）で読むだけで実務に使えるようにする。

---

## 技術スタックと前提

- Astro 5 / Starlight 0.35
- Playwright（E2E）
  - プロジェクト: `chromium` / `msedge` / `iphone`
  - タスク: VS Code Task `playwright:msedge:headed`
- コンテンツ: MDX + content collections

---

## 構造（Information Architecture）

各 Guideline は **役割 × トピック** で分割する。

- enterprise-admin / org-admin / repo-project / developer / user-access

関連セクション：

- Workflows（運用フロー）
- Bible（思想・原則）
- Evolution（標準候補の時点記録のアーカイブ）

---

## 執筆テンプレート（Frontmatter）

```md
---
title: Branch 保護の標準設定
actor: org-admin            # enterprise-admin | org-admin | repo-project | developer | user-access
level: MUST                 # MUST | MUST NOT | SHOULD | MAY
applies_to: default_branch  # 適用範囲
exceptions: |
  リリース緊急対応時は、インシデント手順 7.2 に従い一時的に条件緩和可（要監査ログ）

# 補助メタ
sidebar:
  order: 10                 # サイドバー並び順。0小さいほど上
---

## 規範
- **MUST**: 既定ブランチに Branch Protection を設定しなければならない。
  - 必須: レビュー 1+ / 強制プッシュ禁止 / 必須ステータスチェック / 管理者にも適用

## 理由（Rationale）
レビュー・CI を経ない変更を遮断し、変更の完全性を担保するため。

## 手順（How to）
1. Settings → Branches → Add rule
2. …（画面手順）

## 例外（Allowed Exceptions）
- 緊急 Hotfix のみ。手順 7.2 を参照し、終了後 24h 以内に通常設定へ復帰。

## 参照（References）
- GitHub Docs: Branch protection rules
- 社内規程: SEC-03 変更管理
```

執筆に関する MUST/SHOULD：

- **MUST**: YAML/Frontmatter でタブ文字を使用しない（スペースのみ）
- **MUST**: MDX のコメントは `{/* ... */}` を用い、HTML コメント `<!-- ... -->` を使用しない
- **SHOULD**: サイドバーの順序は `sidebar.order` で制御する（ファイル名連番には依存しない）

---

## コンテンツ規約（命名・自動一覧）

- Evolution 記事のファイル名は `YYYY-MM(-DD)-NNN.mdx` とする（例: `2025-09-001.mdx`）。
  - **MUST**: 年月（任意で日付）+ 3桁連番。これにより自動一覧（降順）に反映される。
- Evolution の一覧はコンポーネントで自動生成する（`EvolutionList.astro`）。

---

## UI 実装規約（Astro/Starlight）

- コンポーネントオーバーライド
  - `ThemeSelect.astro` / `LanguageSelect.astro` を `astro.config.ts` の `components` で差し替える。
  - **MUST**: クライアントスクリプトはブラウザで確実に実行される形式（`<script is:inline>` 等）。
  - **SHOULD**: 破壊的なグローバル CSS を避け、局所スタイルで最小限に。
  - **SHOULD**: モバイル時のクリックブロックを避けるため、必要に応じ `z-index` と `pointer-events:auto` を付与。

- ThemeSelect（仕様）
  - 1 ボタンで `auto → dark → light → auto` に循環。
  - 状態は `data-theme` と `localStorage` に保持、リロード後も反映。
  - **MUST**: `<html data-theme="{dark|light}">` へ即時反映（auto はシステム設定に従う）。
  - **SHOULD**: カスタムエレメントに `cycleTheme()` を公開しておく（E2E からの最終フォールバック）。

- LanguageSelect（仕様）
  - クリックでメニューを開閉。ESC / 外側クリックで閉じる。
  - メニューは `position: fixed` で開き、ビューポートに収まるよう上下自動ドロップ。
  - **MUST**: `aria-haspopup="menu"` / `aria-expanded` を適正に更新。
  - **SHOULD**: 初期化完了を `data-ready` 等で明示。

---

## スタイル指針

- **SHOULD**: 基本はテーマトークン（`/src/styles/tokens.css`）を用い、色/アクセントのみの最小上書き。
- **SHOULD**: 文字サイズは `html { font-size: 90% }` 程度に留める（既定UI破壊を避ける）。
- **MAY**: Mermaid の見た目調整が必要な場合のみ `mermaid.css` を有効化。

---

## 図（Mermaid）

- **SHOULD**: サブグラフやレイアウト方向（LR など）を活用し、俯瞰と詳細を両立。
- **MAY**: 色分け・凡例で役割やフローを明示。
- **MUST**: 詳細復元可能な粒度で情報を保持（要件で情報欠落が発生しないこと）。

---

## E2E テスト規約（証跡を含む）

- 目的: PC/モバイル双方で UI 仕様（Theme/Language）が「実際に動く」ことを保証し、再現性のある証跡を残す。

必須要件：

- **MUST**: Page Object Model（POM）を用いる（`tests/e2e/pages/header.ts`）。
- **MUST**: PC モードとモバイルモードのシナリオを用意する（例: `header-pc-and-mobile.spec.ts`）。
- **MUST**: 失敗時の証跡（trace/screenshot/video）を残す（Playwright 設定済: `retain-on-failure`）。
- **MUST**: 重要操作点では明示的にスクショを添付（`header.snap()`）。
- **SHOULD**: タイムアウトは短め（例: 8s 程度 / 各 expect は 1.5s 目安）。
- **SHOULD**: クリック不応に対する多段フォールバック（要素クリック → 別インスタンス → 座標クリック → CE API 呼び出し）。

検証観点（例）：

- ThemeSelect
  - 循環切替が行えること、リロード後も保持されること（PC/モバイル）
  - UI 状態（`data-theme`）または実効テーマ（`<html data-theme>`）のいずれかが変わること
- LanguageSelect
  - メニューが開き、ESC/外側クリックで閉じる
  - メニューがビューポート内で上下いずれかに開く
  - メニューのリンククリックで実際にナビゲーションする

実行方法：

- VS Code タスク: `playwright:msedge:headed`
  - BASE URL: `http://localhost:4321`（開発サーバ起動済みを前提）
  - 実行後、`playwright-report/` に HTML レポート、Attachments にスクショ/トレース/動画が保存される。

---

## Definition of Done（受け入れ基準）

- **MUST**: Build/Lint/Test が PASS（Playwright 含む）。
- **MUST**: PC/モバイルの仕様検証が自動化され、証跡がレポートで確認できる。
- **MUST**: 役割×トピックの文書がテンプレートに従い、Frontmatter/サイドバーが正しく設定されている。
- **SHOULD**: スタイル上書きは最小限でレイアウト破壊を招かない。

---

## 例外（Allowed Exceptions）

- 緊急対応などでテストや証跡を一時的に省略する場合、理由・影響・復帰期限（24h 以内）を明記し、PRに記録する。

---

## 参照（References）

- Astro / Starlight Docs
- Playwright Docs（HTML Reporter, Tracing, Attachments）
- 本リポジトリの `astro.config.ts` / `playwright.config.ts` / `tests/e2e/*`
