# 🚀 TimeSync デプロイ手順

このアプリを友達と使えるようにするには、**インターネット上に公開（デプロイ）** する必要があります。
以下の手順で、無料で公開できます。

## 手順1: GitHubにアップロード

既にローカルでコミットは完了しています。以下のコマンドを実行してGitHubにアップロードしてください。

```bash
# 1. GitHubリポジトリを作成 (ブラウザで github.com/new にアクセスしてもOK)
# コマンドラインツール(gh)を使える場合:
gh repo create TimeSync --public --source=. --remote=origin --push

# または手動でリポジトリ作成後、以下を実行:
git remote add origin https://github.com/<あなたのユーザー名>/TimeSync.git
git branch -M main
git push -u origin main
```

## 手順2: Vercelで公開 (推奨)

Next.jsで作られたこのアプリは、**Vercel** というサービスを使うのが一番簡単です。

1. **[Vercel.com](https://vercel.com/signup)** にアクセスし、GitHubアカウントでログインします。
2. **"Add New..."** -> **"Project"** をクリックします。
3. 先ほどアップロードした `TimeSync` リポジトリの **"Import"** ボタンを押します。
4. **Environment Variables (環境変数)** の設定項目を開きます。
5. 手元の `.env.local` ファイルの中身をコピーして、キーと値をそれぞれ入力して追加します。
   
   | Key | Value |
   | --- | --- |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIza...` (あなたのキー) |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `timesync...` |
   | ...ほか全ての項目... | ... |

6. **"Deploy"** ボタンを押します。
7. 1分ほど待つと、URLが発行されます（例: `timesync-app.vercel.app`）。このURLを友達に教えればOKです！
