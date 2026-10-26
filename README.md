# サーモンラン解析Wiki

VitePress 1.6.4で生成する静的サイトです。公開対象は`.vitepress/dist`だけです。リポジトリ内の解析証拠、PCAP、鍵ファイル、`.env`はサイトへコピーしません。

```sh
bun install --frozen-lockfile
bun run docs:dev
```

編集中は`http://127.0.0.1:4173/`で確認します。`docs:dev`はMarkdownやVueの変更を自動反映します。公開用ビルドを確認するときは`bun run docs:build`の後に`bun run docs:preview`を使います。

Markdownの整形は`bun run format:md`、整形の確認は`bun run format:md:check`を使います。

`main`へのpush後、GitHub Actionsが確認とビルドを行い、`wiki.splatnet3.com`へ公開します。リポジトリのActions secretsには`CLOUDFLARE_API_TOKEN`と`CLOUDFLARE_ACCOUNT_ID`を設定します。手元から公開する場合は、同じ環境変数を設定して`bun run deploy:check`、`bun run deploy`を実行します。
