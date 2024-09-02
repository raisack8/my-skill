## データ取得手順

`/app/libs`にDB操作モジュールを作る。  
各コンポーネントではSQL実行関数を実行し、返り値を取得する。

```js
import { sql } from '@vercel/postgres';
```
これを記載することで、環境変数を使ってDBに接続することができる。

返却値は`sql`の後ろに定義することで、型を指定できる。
```js
const data = await sql<InvoiceForm>`~~~`
```
### SELECT

```js
import { sql } from '@vercel/postgres';

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}
```

### INSERT

Formから受け取ったデータをDBに挿入するケースを想定する。

1. `form`タグを使い、`/app/lib/actions.ts`で定義したアクションを`action`にセットする。
```js
import { createInvoice } from '@/app/lib/actions';
...
<form action={createInvoice}>
    <input />...
    <Button type="submit">
</form>
```
**/app/lib/actions.ts**
```js
'use server';
 
export async function createInvoice(formData: FormData) {}
```
`use server`を記載すると、ファイル内のすべてのエクスポートされた関数が`サーバー アクション`としてマークされる。  
現状`Button`を押下すると、`form`タグ内のinputの値を全て`formData`という変数にオブジェクトとして代入される。

2. 任意の形で入ってくることがあるので、型検証する。
```js
import { z } from 'zod';

// DBスキーマに準じた型
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  // 文字列から強制的に数字に変換するよう設定
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

// ここでの検証する値は"customerId", "amount", "status"なので
// 検証不要なものは除外して変数に格納する。
const CreateInvoice = FormSchema.omit({ id: true, date: true });
```
[Zodライブラリ](https://zod.dev/)

3. FormDataを分解して、検証に問題がなかったらDBに登録する
```js
const { customerId, amount, status } = CreateInvoice.parse({
customerId: formData.get('customerId'),
// Zodによって数値型に変換
amount: formData.get('amount'),
status: formData.get('status'),
});
// DBに挿入するための値づくり
const amountInCents = amount * 100;
const date = new Date().toISOString().split('T')[0];

await sql`
INSERT INTO invoices (customer_id, amount, status, date)
VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
```

4. DBを更新して一覧画面にリダイレクトする  
Next.jsにはルートセグメントをユーザーのブラウザに一定期間保存する`クライアント側ルーターキャッシュ`がある。  
そのままリダイレクトしたら、DB更新前の値で作られた一覧が表示されたままになってしまうので、  
更新したい場合は、古いページのキャッシュを削除する必要がある。  
そのうえで、目当てのルートにリダイレクトする。
```js
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// キャッシュを削除したいパスを引数に指定
revalidatePath('/dashboard/invoices');
redirect('/dashboard/invoices');
```

まとめると以下

**/app/lib/actions.ts**
```js
'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres'; 
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
```

### UPDATE

`form`で受け取ったIDのデータを更新したい。  
下記のようにsubmitを受けたらメソッドに引数を入れて実行したい。  
このメソッドはinputのデータを受取り、引数で受けたidのデータを変更するメソッド。
```js
// Passing an id as argument won't work
<form action={updateInvoice(id)}>
```

ただし、これはできない。  
これを実現するには、`bind`を使用する。
```js
export default function EditInvoiceForm({
  invoice,
  customers,
}: {
  invoice: InvoiceForm;
  customers: CustomerField[];
}) {
  // bind
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
 
  return (
    <form action={updateInvoiceWithId}>
      <input type="hidden" name="id" value={invoice.id} />
    </form>
  );
}
```

!!! warning
    `<input type="hidden" name="id" value={invoice.id} />`
    のようにinputにvalueを入れる方法もあるが、IDなどの機密データを入れるのには適していない。

Insert同様`Zod`を使用して肩を検証したうえでクエリを実行する。
```js
// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  try {
    await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
```
1. formDataからデータを抽出しています。
2. Zod を使用して型を検証します。
3. 金額をセントに変換します。
4. 変数を SQL クエリに渡します。
5. revalidatePathクライアント キャッシュをクリアし  
新しいサーバー要求を行うために呼び出します。
6. redirectユーザーを請求書のページにリダイレクトするための呼び出し。

### DELETE

他と同様。

```js
import { deleteInvoice } from '@/app/lib/actions';
 
// ...
 
export function DeleteInvoice({ id }: { id: string }) {
  const deleteInvoiceWithId = deleteInvoice.bind(null, id);
 
  return (
    <form action={deleteInvoiceWithId}>
      <button type="submit" className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-4" />
      </button>
    </form>
  );
}
```

actionにDELETEメソッド作成。

```js
export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}
```


## Promise

### リクエストウォーターフォール

前のリクエストの完了に依存する一連のネットワーク リクエストを指します。

各リクエストは前のリクエストがデータを返した後にのみ開始できます

### 並列データ取得

ウォーターフォールを回避する一般的な方法は、  
すべてのデータ要求を同時に、つまり並行して開始することです。

`Promise.all()`, `Promise.allSettled()`関数を使用して  
すべてのPromiseを開始する。

```js
export async function fetchCardData() {
  try {
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;
 
    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);
    // ...
  }
}
```

パフォーマンス向上。

## Zod 

[Zod](https://zod.dev/)で型検証を行う。  
型を宣言するのと同時に、バリデーションメッセージも設定できる。
```js
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
 
```