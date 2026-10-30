# サーモンラン解析Wiki

VitePress 1.6.4で生成する静的サイトです。原稿は`docs/`に置き、`docs/.vitepress/dist`だけを公開します。解析証拠、PCAP、鍵ファイル、`.env`はサイトに含めません。

```sh
bun install --frozen-lockfile
bun run docs:dev
```

開発中は`http://127.0.0.1:4173/`でプレビューできます。公開用ビルドの確認には`bun run docs:build`と`bun run docs:preview`を使います。

Markdownの整形は`bun run format:md`、整形チェックは`bun run format:md:check`を実行します。

`master`へのpush後、GitHub Actionsがテストとビルドを行い、`wiki.splatnet3.com`へデプロイします。Actions secretsには`CLOUDFLARE_API_TOKEN`と`CLOUDFLARE_ACCOUNT_ID`を設定します。手元からデプロイする場合は、同じ環境変数を設定して`bun run deploy:check`と`bun run deploy`を実行します。
