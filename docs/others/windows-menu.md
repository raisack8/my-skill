# Windows の従来の右クリックメニューを常時開く方法

コマンドプロンプトを管理者権限で実行し、以下を実行して、エクスプローラを再起動する。

```reg
reg.exe add "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" /f /ve
```

設定を元に戻したい場合は以下を実行する。

```
reg.exe delete "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}" /f
```
