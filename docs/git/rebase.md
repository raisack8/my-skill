git rebase の基本から使いどころまで、わかりやすく解説します。

## ざっくり一言で
「過去の履歴をキレイに並べ直す」コマンド。

ブランチの履歴を「分岐なしの一直線」に整えたり、不要なコミットを消したり、まとめたりできる。

## merge と rebase の違い

|**比較項目**	|**git merge**	|**git rebase**|
|-|-|-|
|履歴の見た目	|分岐が残る	|一直線に整形される|
|使う場面	|コミットの記録を残したい	|履歴をきれいにしたい（主に開発中）|
|コンフリクト対応	|あり	|あり（発生したら --continue）|

## 基本的な使い方と例
### ① 開発ブランチを最新のmainに追従したいとき
```sh
git checkout feature-branch
git rebase main
```
➡ feature-branch の履歴が、main の後ろに「付け替え」られる  
（＝mainの変更を先に取り込んで、自分の作業を上に積む）

### ② コミットを編集・整形したいとき（インタラクティブリベース）
```sh
git rebase -i HEAD~3  # 過去3件を編集対象にする
```
エディタで以下のような画面になる：

```sh
pick a1b2c3d Fix typo
pick d4e5f6g Add login function
pick h7i8j9k Fix login bug
```
↓変更したい行をこう書き換える：

```sh
pick a1b2c3d Fix typo
squash d4e5f6g Add login function
squash h7i8j9k Fix login bug
```
➡ 「squash」で3つのコミットを1つにまとめる

## よく使うオプションまとめ

|**コマンド例**	|**説明**|
|-|-|
|git rebase main	|main の最新に追従|
|git rebase -i HEAD~3	|過去3件のコミットを編集|
|git rebase --continue	|コンフリクト解消後の続行|
|git rebase --abort	|リベース操作を中止|
|git rebase --skip	|問題あるコミットをスキップ|

## 実用的な使い方まとめ

|**シーン**	|**コマンド**	|**効果**|
|-|-|-|
|コミットを1つにまとめたい	|git rebase -i + squash	|PR前に履歴を整理|
|mainの最新を取り込みたい	|git rebase main	|コンフリクトを早期に見つけやすくなる|
|「余計な修正」を消したい	|git rebase -i + drop	|コミット履歴をクリーンにできる|

## 注意点
push済みの履歴をrebaseで書き換えると、他の人と競合しやすい。  
→ 基本的に rebase は「自分のローカルだけで使う」のが安全。

