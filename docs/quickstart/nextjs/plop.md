# Next.js で使えるテンプレートの作り方

- plop インストール

```sh
pnpm add -D plop
# 開発時のみ必要な場合
```

- `package.json` に `"type": "module"` を追加

```json
{
  "name": "web-dev-utils",
  "version": "0.1.0",
  "private": true,
  "type": "module", // このように追加
  ・・・
}
```

- `plopfile.js` をワークディレクトリ直下に作成し、以下のように内容を書く。
<details>
<summary>コードはこちらです。</summary>

```js
export default function (plop) {
  // Server Component Generator
  plop.setGenerator("server-component", {
    description: "Next.js Server Component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name:",
      },
      {
        type: "input",
        name: "path",
        message: "Component path (default: src/components):",
        default: "src/components",
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{path}}/{{pascalCase name}}.tsx",
        templateFile: "templates/server-component.hbs",
      },
    ],
  });

  // Client Component Generator
  plop.setGenerator("client-component", {
    description: "Next.js Client Component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name:",
      },
      {
        type: "input",
        name: "path",
        message: "Component path (default: src/components):",
        default: "src/components",
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{path}}/{{pascalCase name}}.tsx",
        templateFile: "templates/client-component.hbs",
      },
    ],
  });

  // Page Component Generator
  plop.setGenerator("page-component", {
    description: "Next.js Page Component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Page name:",
      },
      {
        type: "input",
        name: "path",
        message: "Page path (default: src/app):",
        default: "src/app",
      },
    ],
    actions: [
      {
        type: "add",
        path: "{{path}}/{{kebabCase name}}/page.tsx",
        templateFile: "templates/page.hbs",
      },
    ],
  });
}
```

</details>

- `package.json`に以下のようにコマンドを登録する

```json
"gen:server": "plop server-component",
"gen:client": "plop client-component",
"gen:page": "plop page"
```

- 以下のようにコンポーネントのテンプレートファイルを作成する
<details>
<summary>client-component.hbs</summary>

```js
'use client';

import { useState } from 'react';

interface {{pascalCase name}}Props {
  children?: React.ReactNode;
}

export default function {{pascalCase name}}({ children }: {{pascalCase name}}Props) {
  return (
    <div>
      {children}
    </div>
  );
}
```

</details>

<details>
<summary>server-component.hbs</summary>

```js
interface {{pascalCase name}}Props {
  children?: React.ReactNode;
}

export default function {{pascalCase name}}({ children }: {{pascalCase name}}Props) {
  return (
    <div>
      {children}
    </div>
  );
}
```

</details>

<details>
<summary>page-component.hbs</summary>
```js
export default function {{pascalCase name}}Page() {
  return (
    <div className="p-8">
      <p>This is the {{name}} page.</p>
    </div>
  );
}
```
</details>

後は `pnpm run gen:server` のようにコマンドを入力すると、対話形式で会話が出来るので、以下のように入力する。

```sh
pnpm run gen:client

? Component name: Sidebar # 作成したいコンポーネント名を入力する
? Component path (default: src/components): src/components # コンポーネントを配置するディレクトリを入力する。
✔  ++ /src/components/Sidebar.tsx
```

page コンポーネントの場合は `Component name` は入力不要。

```sh
pnpm run gen:page


? Page name: # 何も入力しない
? Page path (default: src/app): src/app/test # コンポーネントを配置するディレクトリを入力する。
✔  ++ /src/app/test/page.tsx
```
