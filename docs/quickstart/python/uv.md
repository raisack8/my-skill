# uvのクイックスタート

[公式ドキュメント](https://docs.astral.sh/uv/)

```sh
uv init
uv venv

# requirements.txt からインストールする場合
uv add -r requirements.txt

# pyproject.toml からインストールする場合
uv sync

# 実行方法
uv run python script.py
```