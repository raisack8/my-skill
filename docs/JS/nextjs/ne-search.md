### URL 検索パラメータを使用するメリット

- ブックマークおよび共有可能な URL
    - 検索パラメータは URL に含まれている
    - ユーザーは検索状態をブックマークすることができる
- サーバー側レンダリングと初期ロード
- 分析と追跡
    - 検索クエリとフィルターを URL に直接含める
    - ユーザーの行動を追跡しやすくなる

### 入力に応じてパスを変える

```js
'use client';
 
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
 
export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
 
  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }
}
```

```js
const params = new URLSearchParams(searchParams);
console.log(params.toString())
```
これは  
`http://localhost:3000/dashboard/invoices?query=aaa`  
のとき  
`query=aaa`  
を返却する。

```js
if (term) {
    // "query"というキーに変数termをセットする
    params.set('query', term);
} else {
    // "query"というキーに紐づいている値を削除する
    params.delete('query');
}
```

```js
// ドメイン以降のパス文字列を取得
const pathname = usePathname();
// 
const { replace } = useRouter();

// replaceの引数のパスにリダイレクトする
replace(`${pathname}?${params.toString()}`);

```

[ルーターを使用する](https://nextjs.org/docs/pages/api-reference/functions/use-router)

inputに初期値を入れておくにはこう。
```js
<input
  ...
  onChange={(e) => {
    handleSearch(e.target.value);
  }}
  defaultValue={searchParams.get('query')?.toString()}
/>
```

こうすることで、ブラウザバックした場合、  
戻る対象はクエリのついたURLなので、検索フォームにも値が入る形になっている。

## クエリ操作まとめ

**クエリの値を取得する**
```js
const searchParams = useSearchParams();

searchParams.get('query')
```

**クエリをセットしてアクセスする**
```js
const searchParams = useSearchParams();
const pathname = usePathname();
const { replace } = useRouter();

const params = new URLSearchParams(searchParams);
params.set('query')
replace(`${pathname}?${params.toString()}`);
```

**クエリを削除してアクセスする**
```js
const searchParams = useSearchParams();
const pathname = usePathname();
const { replace } = useRouter();

const params = new URLSearchParams(searchParams);
params.delete('query')
replace(`${pathname}?${params.toString()}`);
```

## page.tsxでクエリパラメータを受け取る

`page.tsx`は`searchParams`というプロパティを受け取るので、  
以下のようにしてクエリパラメータを取得することができる。

```js
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  // "query"という文字列が無かったら空文字を返す記法
  const query = searchParams?.query || '';
  // "page"という文字列が無かったら1を返す記法
  const currentPage = Number(searchParams?.page) || 1;

  return ()
...
}
```

## デバウンス

関数が実行される頻度を制限するプログラミング手法。  
ユーザーが入力を停止したときにのみデータベースを照会します。

- デバウンスの仕組み:
    1. `トリガーイベント`: デバウンスする必要があるイベント (検索ボックスでのキーストロークなど) が発生すると、タイマーが開始されます。
    2. `待機`: タイマーが期限切れになる前に新しいイベントが発生した場合、タイマーはリセットされます。
    3. `実行`: タイマーがカウントダウンの終了に達すると、デバウンスされた関数が実行されます。

インストール
```sh
pnpm i use-debounce
```

**デバウンスを使う前の関数**
```js
function handleSearch(term: string) {
    Method();
}
```

**デバウンスを使った後の関数**
```js
// ...
import { useDebouncedCallback } from 'use-debounce';
 
// Inside the Search Component...
const handleSearch = useDebouncedCallback((term) => {
    Method();
}, 300);
```

ユーザーが入力を停止してから特定の時間 (`300` ミリ秒) 経過後にのみコードを実行