# コマンド

- 起動コマンド
```sh
claude --dangerously-skip-permissions -r
```

- SerenaMCPをプロジェクトと紐づける
```sh
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena-mcp-server --context ide-assistant --project $(pwd)
```
[Claude Codeを10倍賢くする無料ツール「Serena」の威力とトークン効率化術](https://zenn.dev/sc30gsw/articles/ff81891959aaef)

- puppeteer
```sh
claude mcp add puppeteer -s user -- npx -y @modelcontextprotocol/server-puppeteer
```


## MCP関連

> MCP: Model Context Protocolの略。外部サービスとの連携機能
> 

| コマンド | 説明 | 使用例 |
| --- | --- | --- |
| `/mcp` | MCP設定の管理 | MCP状態確認 |
| `/mcp list` | 接続中のMCPサーバー一覧 | 現在の接続状況 |
| `/mcp add` | MCPサーバーの追加 | 新しいサービス連携 |
| `/mcp remove` | MCPサーバーの削除 | 不要な連携解除 |