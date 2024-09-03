## 認証の追加

この章は複雑なので、こちらの[チュートリアル](https://nextjs.org/learn/dashboard-app/adding-authentication)を見てもらいたい。

`認証`: ユーザーが本人であることの確認

`認可`: ユーザーがアプリを使用できるかどうかの許可

1. ログインフォームを作成し、ログインに必要な情報をformに渡す。  
ここでは`email`と`password`

2. NextAuth.jsの設定
	[NextAuth.js](https://authjs.dev/reference/nextjs)

    ```sh
    # NextAuth.jsのインストール
    pnpm i next-auth@beta

    # アプリケーションの秘密鍵の生成
	openssl rand -base64 32
    ```

	`.env`ファイルに`AUTH_SECRET`を追加
	```.env
	AUTH_SECRET=your-secret-key
	```

3. プロジェクトルートに`/auth.config.ts`を作成。
	```js
	import type { NextAuthConfig } from 'next-auth';
	
	export const authConfig = {
	pages: {
		signIn: '/login',
	},
	} satisfies NextAuthConfig;
	```

4. ミドルウェアでルートを保護  
	これにより、ユーザーはログインしていない限りダッシュボード ページにアクセスできなくなります。
	```js
	import type { NextAuthConfig } from 'next-auth';
 
	export const authConfig = {
	pages: {
		signIn: '/login',
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
		const isLoggedIn = !!auth?.user;
		const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
		if (isOnDashboard) {
			if (isLoggedIn) return true;
			return false; // Redirect unauthenticated users to login page
		} else if (isLoggedIn) {
			return Response.redirect(new URL('/dashboard', nextUrl));
		}
		return true;
		},
	},
	providers: [], // Add providers with an empty array for now
	} satisfies NextAuthConfig;
	```

5. ミドルウェア作成
	```js
	import NextAuth from 'next-auth';
	import { authConfig } from './auth.config';
	
	export default NextAuth(authConfig).auth;
	
	export const config = {
	// https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
	matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
	};
	```

6. `auth.ts`を作成

	```js
	import NextAuth from 'next-auth';
	import Credentials from 'next-auth/providers/credentials';
	import { authConfig } from './auth.config';
	import { z } from 'zod';
	import { sql } from '@vercel/postgres';
	import type { User } from '@/app/lib/definitions';
	import bcrypt from 'bcrypt';
	
	async function getUser(email: string): Promise<User | undefined> {
	try {
    // DBからユーザーをemailで探す
		const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
		return user.rows[0];
	} catch (error) {
		console.error('Failed to fetch user:', error);
		throw new Error('Failed to fetch user.');
	}
	}
	
	export const { auth, signIn, signOut } = NextAuth({
	...authConfig,
	providers: [
		Credentials({
		async authorize(credentials) {
      // Zodでフォームをバリデーション
			const parsedCredentials = z
			.object({ email: z.string().email(), password: z.string().min(6) })
			.safeParse(credentials);
	
      // バリデーションを通過したらgetUser
			if (parsedCredentials.success) {
        const { email, password } = parsedCredentials.data;
        const user = await getUser(email);
        const passwordsMatch = await bcrypt.compare(password, user.password);
    
        if (passwordsMatch) return user;
        }
  
          console.log('Invalid credentials');
          return null;
      }),
    ],
	});
	```

6. `actions.ts`にメソッド追加

  ```js
  'use server';
 
  import { signIn } from '@/auth';
  import { AuthError } from 'next-auth';
  
  // ...
  
  export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
  }
  ```

7. formに設定

  ```js
  import { authenticate } from '@/app/lib/actions';

  export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );
 
  return (
    <form action={formAction} className="space-y-3">
    //...
  )
  ```


8. ログアウト機能

    ```js
    import { signOut } from '@/auth';

    return (
      <form
            action={async () => {
              'use server';
              await signOut();
            }}
          >
      //...
    )

    ```