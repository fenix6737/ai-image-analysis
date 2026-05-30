# デプロイメントガイド

このAI応答システムを常時アクセス可能なWebサイトとしてデプロイする方法を説明します。

## 📋 前提条件

- Node.js (v18以上)
- npm または yarn
- Git
- GitHubアカウント（推奨）

## 🚀 デプロイ方法

### オプション1: Netlify（推奨・最も簡単）

1. **GitHubにプッシュ**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Netlifyでデプロイ**
   - [Netlify](https://www.netlify.com/)にアクセス
   - "Add new site" → "Import an existing project"
   - GitHubリポジトリを選択
   - ビルド設定は自動検出されます（`netlify.toml`を使用）
   - "Deploy site"をクリック

3. **完了！**
   - 数分でデプロイが完了し、URLが発行されます
   - 例: `https://your-site-name.netlify.app`

### オプション2: Vercel

1. **GitHubにプッシュ**（上記と同じ）

2. **Vercelでデプロイ**
   - [Vercel](https://vercel.com/)にアクセス
   - "Add New" → "Project"
   - GitHubリポジトリを選択
   - ビルド設定は自動検出されます（`vercel.json`を使用）
   - "Deploy"をクリック

3. **完了！**
   - デプロイが完了し、URLが発行されます
   - 例: `https://your-site-name.vercel.app`

### オプション3: GitHub Pages

1. **ビルド**
   ```bash
   npm install
   npm run build:web
   ```

2. **GitHub Pagesを有効化**
   - GitHubリポジトリの Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main` / `root`
   - Save

3. **アクセス**
   - `https://<username>.github.io/<repository-name>/`

### オプション4: ローカル開発サーバー

開発中やテスト用：

```bash
# 依存関係のインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:8080` にアクセス

## 🔧 ビルドコマンド

```bash
# 本番用ビルド
npm run build:web

# 開発サーバー起動
npm run dev

# TypeScriptコンパイル
npm run build
```

## 📁 デプロイされるファイル

- `index.html` - メインHTMLファイル
- `dist/web-demo.js` - バンドルされたJavaScript
- その他の静的ファイル

## 🌐 カスタムドメインの設定

### Netlify
1. Site settings → Domain management
2. "Add custom domain"
3. DNSレコードを設定

### Vercel
1. Project Settings → Domains
2. "Add Domain"
3. DNSレコードを設定

## 🔄 自動デプロイ

GitHubにプッシュすると自動的にデプロイされます：

```bash
git add .
git commit -m "Update features"
git push
```

NetlifyまたはVercelが自動的に：
1. 変更を検知
2. ビルドを実行
3. 新しいバージョンをデプロイ

## 🐛 トラブルシューティング

### ビルドエラー

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# ビルドを再実行
npm run build:web
```

### デプロイエラー

1. `netlify.toml` または `vercel.json` の設定を確認
2. Node.jsのバージョンを確認（v18以上）
3. ビルドログを確認

### 404エラー

- リダイレクト設定が正しいか確認
- `netlify.toml` または `vercel.json` のrewritesを確認

## 📊 パフォーマンス最適化

### 本番環境用の最適化

1. **Webpackの最適化**
   ```javascript
   // webpack.config.js
   mode: 'production',
   optimization: {
     minimize: true
   }
   ```

2. **CDNの活用**
   - Netlify/Vercelは自動的にCDNを使用

3. **キャッシュの設定**
   ```toml
   # netlify.toml
   [[headers]]
     for = "/dist/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000"
   ```

## 🔒 セキュリティ

- 環境変数は `.env` ファイルに保存
- `.gitignore` で機密情報を除外
- HTTPS は自動的に有効化されます

## 📈 モニタリング

### Netlify Analytics
- Site settings → Analytics
- トラフィック、パフォーマンスを監視

### Vercel Analytics
- Project → Analytics
- リアルタイムのパフォーマンスデータ

## 💡 推奨デプロイフロー

1. **開発**: `npm run dev` でローカルテスト
2. **ビルド**: `npm run build:web` で本番ビルド
3. **コミット**: Gitにコミット
4. **プッシュ**: GitHubにプッシュ
5. **自動デプロイ**: Netlify/Vercelが自動デプロイ

## 🎯 次のステップ

- カスタムドメインの設定
- Google Analyticsの追加
- パフォーマンスモニタリングの設定
- CI/CDパイプラインの構築

## 📞 サポート

問題が発生した場合：
- [Netlify Docs](https://docs.netlify.com/)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Pages Docs](https://docs.github.com/pages)

---

**注意**: 初回デプロイには5-10分かかる場合があります。