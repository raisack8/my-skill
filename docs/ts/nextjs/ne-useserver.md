# use server

[Reference](https://react.dev/reference/rsc/use-server)

use server ディレクティブは、サーバー側で実行される関数またはファイルを指定します。ファイルの先頭で使用して、ファイル内のすべての関数がサーバー側であることを示すか、関数の先頭にインラインで使用して、関数をサーバー関数としてマークすることができます。これは React の機能です。

## ファイルの先頭で use server を使用する

次の例は、先頭に use server ディレクティブがあるファイルを示しています。ファイル内のすべての関数はサーバー上で実行されます。

```Javascript
'use server'
import { db } from '@/lib/db' // Your database client
 
export async function createUser(data: { name: string; email: string }) {
  const user = await db.user.create({ data })
  return user
}
```

## クライアントコンポーネントでのサーバー関数の使用

クライアント コンポーネントでサーバー関数を使用するには、ファイルの先頭にある use server ディレクティブを使用して、専用ファイルにサーバー関数を作成する必要があります。これらのサーバー関数は、クライアント コンポーネントとサーバー コンポーネントにインポートして実行できます。

actions.ts に fetchUsers サーバー関数があると仮定します。

```Javascript
'use server'
import { db } from '@/lib/db' // Your database client
 
export async function fetchUsers() {
  const users = await db.user.findMany()
  return users
}
```

次に、fetchUsers サーバー関数をクライアント コンポーネントにインポートし、クライアント側で実行できます。

```Javascript
'use client'
import { fetchUsers } from '../actions'
 
export default function MyButton() {
  return <button onClick={() => fetchUsers()}>Fetch Users</button>
}
```

## use server inline を使用する

次の例では、関数の先頭で use server をインラインで使用して、関数をサーバー関数としてマークしています。  
[Server Functions](https://19.react.dev/reference/rsc/server-functions)

```Javascript
import { db } from '@/lib/db' // Your database client
 
export default function UserList() {
  async function fetchUsers() {
    'use server'
    const users = await db.user.findMany()
    return users
  }
 
  return <button onClick={() => fetchUsers()}>Fetch Users</button>
}
```

## セキュリティに関する考慮事項

use server ディレクティブを使用する場合は、すべてのサーバー側ロジックが安全であり、機密データが保護されていることを確認することが重要です。

認証と承認
機密性の高いサーバー側操作を実行する前に、必ずユーザーを認証して承認してください。

```Javascript
'use server'
 
import { db } from '@/lib/db' // Your database client
import { authenticate } from '@/lib/auth' // Your authentication library
 
export async function createUser(
  data: { name: string; email: string },
  token: string
) {
  const user = authenticate(token)
  if (!user) {
    throw new Error('Unauthorized')
  }
  const newUser = await db.user.create({ data })
  return newUser
}
```



---

# 'use server'

!!! note
    「use server」は、React Server Components を使用している場合、またはそれらと互換性のあるライブラリを構築している場合にのみ必要です。

「use server」は、クライアント側コードから呼び出すことができるサーバー側関数をマークします。

## Reference

非同期関数本体の先頭に「use server」を追加して、関数をクライアントから呼び出し可能としてマークします。これらの関数をサーバー アクションと呼びます。

```javascript
async function addToCart(data) {
  'use server';
  // ...
}
```

クライアントでサーバー アクションを呼び出すと、渡された引数のシリアル化されたコピーを含むネットワーク リクエストがサーバーに送信されます。サーバー アクションが値を返す場合、その値はシリアル化されてクライアントに返されます。

関数を個別に「use server」でマークする代わりに、ファイルの先頭にディレクティブを追加して、そのファイル内のすべてのエクスポートを、クライアント コードにインポートされるなど、どこでも使用できるサーバー アクションとしてマークすることができます。

## 注意点

- 'use server' は関数またはモジュールの先頭、インポートを含む他のすべてのコードより上になければなりません (ディレクティブの上のコメントは OK)。これらはバックティックではなく、一重引用符または二重引用符で記述する必要があります。
- 'use server' はサーバー側のファイルでのみ使用できます。結果のサーバー アクションは、props を介してクライアント コンポーネントに渡すことができます。シリアル化については、サポートされているタイプを参照してください。
- クライアント コードからサーバー アクションをインポートするには、ディレクティブをモジュール レベルで使用する必要があります。
- 基盤となるネットワーク呼び出しは常に非同期であるため、'use server' は非同期関数でのみ使用できます。
- サーバー アクションへの引数は常に信頼できない入力として扱い、すべてのミューテーションを承認します。セキュリティに関する考慮事項を参照してください。
- サーバー アクションは遷移で呼び出す必要があります。<form action> または formAction に渡されたサーバー アクションは、遷移で自動的に呼び出されます。
- サーバー アクションは、サーバー側の状態を更新するミューテーション用に設計されています。データの取得には推奨されません。したがって、サーバー アクションを実装するフレームワークは通常、一度に 1 つのアクションを処理し、戻り値をキャッシュする方法がありません。

## セキュリティに関する考慮事項

サーバー アクションへの引数は、完全にクライアントによって制御されます。セキュリティのため、引数は常に信頼できない入力として扱い、必要に応じて引数を検証してエスケープしてください。

どのサーバー アクションでも、ログインしたユーザーがそのアクションを実行できるかどうかを必ず検証してください。

!!! worning 
    サーバー アクションから機密データが送信されないようにするために、一意の値とオブジェクトがクライアント コードに渡されるのを防ぐ実験的な汚染 API があります。

    experimental_taintUniqueValue および experimental_taintObjectReference を参照してください。

[experimental_taintUniqueValue](https://react.dev/reference/react/experimental_taintUniqueValue)
[experimental_taintObjectReference](https://react.dev/reference/react/experimental_taintObjectReference)

## シリアル化可能な引数と戻り値

クライアント コードがネットワーク経由でサーバー アクションを呼び出すため、渡される引数はシリアル化可能である必要があります。

サーバー アクション引数でサポートされている型は次のとおりです。

[Serializable arguments and return values](https://react.dev/reference/rsc/use-server#serializable-parameters-and-return-values)

特に、次のものはサポートされていません:

- React 要素、または JSX
- 関数 (コンポーネント関数やサーバー アクションではないその他の関数を含む)
- クラス
- 任意のクラスのインスタンスであるオブジェクト (前述の組み込みクラス以外)、または null プロトタイプを持つオブジェクト
- グローバルに登録されていないシンボル (例: Symbol('my new symbol'))
サポートされているシリアル化可能な戻り値は、境界クライアント コンポーネントのシリアル化可能なプロパティと同じです。

## 使用法

### フォーム内のサーバーアクション

サーバー アクションの最も一般的な使用例は、データを変更するサーバー関数を呼び出すことです。ブラウザーでは、HTML フォーム要素は、ユーザーが変更を送信するための従来の方法です。React サーバー コンポーネントを使用すると、React はフォームでサーバー アクションのファーストクラスのサポートを導入します。

ユーザーがユーザー名を要求できるフォームを次に示します。

```javascript
// App.js

async function requestUsername(formData) {
  'use server';
  const username = formData.get('username');
  // ...
}

export default function App() {
  return (
    <form action={requestUsername}>
      <input type="text" name="username" />
      <button type="submit">Request</button>
    </form>
  );
}
```

この例では、requestUsername は <form> に渡されるサーバー アクションです。ユーザーがこのフォームを送信すると、サーバー関数 requestUsername へのネットワーク リクエストが行われます。フォームでサーバー アクションを呼び出すと、React はフォームの FormData をサーバー アクションの最初の引数として提供します。

サーバー アクションをフォーム アクションに渡すことで、React はフォームを段階的に拡張できます。つまり、JavaScript バンドルが読み込まれる前にフォームを送信できます。

### フォームでの戻り値の処理

ユーザー名リクエスト フォームでは、ユーザー名が使用できない可能性があります。 requestUsername は、失敗したかどうかを通知します。

プログレッシブ エンハンスメントをサポートしながら、サーバー アクションの結果に基づいて UI を更新するには、useActionState を使用します。


```javascript
// requestUsername.js
'use server';

export default async function requestUsername(formData) {
  const username = formData.get('username');
  if (canRequest(username)) {
    // ...
    return 'successful';
  }
  return 'failed';
}
```

```javascript
// UsernameForm.js
'use client';

import { useActionState } from 'react';
import requestUsername from './requestUsername';

function UsernameForm() {
  const [state, action] = useActionState(requestUsername, null, 'n/a');

  return (
    <>
      <form action={action}>
        <input type="text" name="username" />
        <button type="submit">Request</button>
      </form>
      <p>Last submission request returned: {state}</p>
    </>
  );
}
```

ほとんどのフックと同様に、useActionState はクライアント コードでのみ呼び出すことができることに注意してください。

### <form> 外でサーバーアクションを呼び出す

サーバー アクションは公開されたサーバー エンドポイントであり、クライアント コードのどこからでも呼び出すことができます。

フォームの外部でサーバー アクションを使用する場合は、遷移でサーバー アクションを呼び出します。これにより、読み込みインジケーターを表示したり、楽観的な状態の更新を表示したり、予期しないエラーを処理したりできます。フォームは、遷移でサーバー アクションを自動的にラップします。

```javascript
import incrementLike from './actions';
import { useState, useTransition } from 'react';

function LikeButton() {
  const [isPending, startTransition] = useTransition();
  const [likeCount, setLikeCount] = useState(0);

  const onClick = () => {
    startTransition(async () => {
      const currentCount = await incrementLike();
      setLikeCount(currentCount);
    });
  };

  return (
    <>
      <p>Total Likes: {likeCount}</p>
      <button onClick={onClick} disabled={isPending}>Like</button>;
    </>
  );
}
```

```javascript
// actions.js
'use server';

let likeCount = 0;
export default async function incrementLike() {
  likeCount++;
  return likeCount;
}
```

サーバーアクションの戻り値を読み取るには、返される promise を待機する必要があります。