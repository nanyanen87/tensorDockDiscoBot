# Discord Bot コマンドサーバー

このプロジェクトは、Discord Bot 用のコマンドサーバーを構築するためのテンプレートです。ここでは、ボットの設定から環境変数の設定、実行までの手順を説明します。

## 動作環境
- Node.js v18.19.1
- npm 9.2.0

## 1. Bot を Discord 開発者ポータルで作成する
1. Discord [開発者ポータル](https://discord.com/developers/applications) にアクセスし、新しいアプリケーションを作成します。
2. **"Bot"** タブから Bot を追加します。
3. **Bot トークン**をコピーします（後で `.env` ファイルに使用します）。
4. **OAuth2** タブで、以下の設定を行い、Bot をサーバーに招待します。
    - **Scopes**: `bot`, `applications.commands`
    - **Bot Permissions**: `Send Messages`, `Read Message History`, `Use Slash Commands`（必要に応じて追加）

## 2. プロジェクトのクローンと依存関係のインストール
ターミナルで以下のコマンドを実行して、プロジェクトをクローンします。

```bash
git clone https://github.com/nanyanen87/tensorDockDiscoBot.git
cd tensorDockDiscoBot
npm install
```

## 3. `.env` ファイルの設定
プロジェクトのルートディレクトリに `.env` ファイルを作成し、以下の内容を記述します。

```
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN
DISCORD_CLIENT_ID=YOUR_CLIENT_ID
MY_DISCORD_ID=YOUR_DISCORD_ID
TENSOR_DOCK_API_KEY=YOUR_TENSOR_API_KEY
TENSOR_DOCK_API_TOKEN=YOUR_TENSOR_API_TOKEN
```

`.env` ファイルの各項目の説明は以下の通りです。


- **DISCORD_TOKEN**: Discord ボットのトークン
- **DISCORD_CLIENT_ID**: Discord アプリケーションのクライアント ID
- **MY_DISCORD_ID**: 管理者用の Discord ユーザー ID
- **TENSOR_DOCK_API_KEY**: TensorDock API の API キー
- **TENSOR_DOCK_API_TOKEN**: TensorDock API の API トークン


## 4. スラッシュコマンドのデプロイ
コマンドを Discord サーバーに登録します。以下のコマンドを実行してください。

```bash
node deploy-commands.js
```

実行後、以下のようなメッセージが表示されれば成功です。
```
Successfully registered application commands.
```

## 5. ボットの起動
ボットを起動するには、以下のコマンドを使用します。

```bash
node index.js
```

起動に成功すると、ターミナルに以下のメッセージが表示されます。
```
Ready! Logged in as tensordock-bot#8212
```

## 6. 使用方法
- /ping：ボットがオンラインであることを確認します。
- /test：tensorDock につながるか確認します。
- /list：TensorDock に登録されているモデルの一覧を表示します。
- /start server_id：TensorDock に登録されているモデルを起動します。
- /stop：server_id:TensorDock に登録されているモデルを停止します。
- /info server_id：TensorDock に登録されているモデルの詳細情報を表示します。

---
