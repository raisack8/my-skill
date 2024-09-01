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

**SELECT例**
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

