# Copilot Instructions for GH-OPS Guide

この文書は GH-OPS Guide の執筆者向けガイドラインです。  
**RFC 2119 に準拠した表現体系**を採用します。

---

## 用語の強度レベル

- **MUST**: 絶対に守らなければならない  
- **MUST NOT**: 絶対に行ってはならない  
- **SHOULD**: 強く推奨されるが、合理的理由があれば例外可（要記録）  
- **MAY**: 任意。やってもよい

---

## Guideline の構造

各 Guideline は **役割 × トピック** で分割します。

- enterprise-admin  
- org-admin  
- repo-project  
- developer  
- user-access  

---

## 執筆テンプレート

```md
---
title: Branch 保護の標準設定
actor: org-admin            # enterprise-admin | org-admin | repo-project | developer | user-access
level: MUST                 # MUST | MUST NOT | SHOULD | MAY
applies_to: default_branch  # 適用範囲
exceptions: |
  リリース緊急対応時は、インシデント手順 7.2 に従い一時的に条件緩和可（要監査ログ）
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

---

## 執筆の原則

- **Guideline** には原則として MUST / MUST NOT / SHOULD / MAY を明示する  
- **Bible** は思想・原則を簡潔にまとめる  
- **Evolution** は「標準候補の時点記録」だけを扱う  
- 各ページは自完結させ、他の文書を参照しなくても理解できるようにする
