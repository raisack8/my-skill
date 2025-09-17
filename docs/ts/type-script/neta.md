# 小ネタ

## `Date()`は文字列型

Date 型を宣言したい場合は`new`をつけないと、文字列として認識されてしまう。

```
console.log(typeof Date())
console.log(Date())
console.log(typeof new Date())
console.log(new Date())

---
string
Tue Sep 16 2025 23:13:41 GMT+0900 (日本標準時)
object
2025-09-16T14:13:41.325Z
```
