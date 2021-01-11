# DEPRECATED

The VRChat API has probably changed. This unofficial tool is deprecated. thx.

# VRChat Message Util

VRChat の notification API を利用して、通知を送信可能な相手に任意の文字列を通知するツールです。

## Usage

### Install

```
npm install
npm run build
```

初回のみ、以下のコマンドを実行してユーザ情報を設定してください。

```
./bin/run init
```

ここで入力したユーザ情報は、 VRChat API から認証トークンを取得するためにのみ VRChat API に送信されます。
その他のネットワークへは送信されず、ローカルファイルにも記録されません。

取得した認証トークンは、リポジトリディレクトリ内の `config.json` ファイルに記録されます。

### Run

```
./bin/run send
```

プロンプトから送信相手を選んでください。その後、送信内容を入力して実行してください。

### Notice

- 自分がいるインスタンス・オンライン状態などによっては、通知が失敗することがあります。
- 通知が正しく送られたかどうか、確認する方法はありません。
- 受信した通知を Accept しても何も起こりません。
- ツールが正しく動作しない場合、 `init` コマンドを再実行することで解決する場合があります。
- API 仕様の変更などによって、予告なくツールの動作が変わる可能性があります。
