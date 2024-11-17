[公式ドキュメント](https://next-auth.js.org/)  
[動画チュートリアル](https://www.youtube.com/watch?v=2xexm8VXwj8&t=973s)

## ログイン認証に必要なもの

- ./auth.ts
- ./app/api/auth/[...nextauth]/route.ts
- (middleware.ts)
- 環境変数
- 各プロバイダのID及びシークレット

### auth.ts

ワークディレクトリ直下に作成

- `providers`: ログイン認証したいものを列挙。(例: [Github](https://next-auth.js.org/providers/github))
    - 各設定は各々の
- `basePath`: nextauthエンドポイントを設定しているパスを指定する。(環境変数の`AUTH_URL`とも一致)
    - ./app/api/auth/**[...nextauth]**/route.ts
- `authorized`: middleware.tsの設定が必要
    - return true: 認証が通っていなくても画面を閲覧できる
    - return false: 認証を通さないと閲覧できない画面
        - ユーザー認証が必要な画面とそうでない画面とで分岐させる。

```typescript
import NextAuth, { NextAuthConfig } from "next-auth"; 
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

export const config: NextAuthConfig = {
  theme:{
    logo: "" // ログイン画面にアイコンをセットしたい場合はここに絶対パスを指定する
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      // ...Googleログインに必要な認証はここに書く
    })
  ],
  basePath: "/api/auth",
  callbacks: {
    // 認証したユーザーだけが使ってもいいですよ。ミドルウェア
    authorized({request, auth}){
      try {
        const { pathname } = request.nextUrl;
        // trueを返せばページを見ることができる
        if(pathname === "/protected-page") return !!auth;
        return true;
      }catch (err) {
        console.error(err)
      }
    },
    // 認証に成功した場合作成される(jwtトークン)
    jwt({token, trigger, session}){
      if(trigger === "update") token.name = session.user.name;
      return token;
    }
  }
}

// page.tsx等では下記のものを使用してログイン情報を取得・削除する
export const { handlers, auth, signIn, signOut } = NextAuth(config);
```

### ./app/api/auth/[...nextauth]/route.ts

これがないとプロバイダにアクセスできない。

```typescript
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

### (middleware.ts)

ワークディレクトリ直下に作成  
[ドキュメント](https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher)

```typescript
export { auth as middleware } from "@/auth"

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
}
```

### 環境変数

- `AUTH_SECRET`: ランダムな16進数の文字列を生成。
    - 生成コマンド: `openssl rand -hex 32`
- `AUTH_URL`: `./app/api/auth/[...nextauth]/route.ts` ここと一致したパスを指定する。

```env
AUTH_SECRET=c66ab3bb9e1dba3ab~~~~~~~~~~~~~~~~

AUTH_URL=http://localhost:3000/api/auth
AUTH_AUTH0_ID=
AUTH_AUTH0_SECRET=
AUTH_AUTH0_ISSUER=

AUTH_FACEBOOK_ID=
AUTH_FACEBOOK_SECRET=

AUTH_GITHUB_ID=~~~~~~~~~~~~
AUTH_GITHUB_SECRET=~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

AUTH_TWITTER_ID=
AUTH_TWITTER_SECRET=

```

##　使用方法

###　サインイン

**UserButton.tsx**

```typescript
export default async function UserButton() {

  const session = await auth();
  if(!session?.user) return <SignIn/>

  return (
    ...
```

サインインしていたら、2つ目のreturn以降が表示される。  
していなかったらログインボタンが表示される。

**SignIn.tsx**

```typescript
export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form action={async()=>{
      "use server";
      await signIn(provider)
    }}>
      <Button {...props}>サインイン</Button>
    </form>
  );
}
```

サインイン以降は以下のように値を取得できる。

```typescript
    <Avatar className="w-8 h-8">
        {session.user.image && (
        <AvatarImage src={session.user.image} alt={session.user.name ?? ""}/>
        )}
        <AvatarFallback>{session.user.email}</AvatarFallback>
    </Avatar>
```

###　サインアウト

```typescript
export function SignOut({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form 
      className="w-full"
      action={async()=>{
      "use server";
      await signOut()
    }}>
      <Button variant="ghost" className="w-full p-0" {...props}>
        ログアウト
      </Button>
    </form>
  );
}

```

### クライアントサイドでの使用法

`useSession`を使用。  
ユーザー情報をJSON形式で表示  

```typescript
export default function ClientExample() {

  const {data: session, status} = useSession()

  return (
    <div>{JSON.stringify(session, null, 2)}</div>
  );
}

```

useSessionを使う場合には`SessionProvider`でラップしなくてはいけない。

```typescript
const ClientPage = async () => {
  return (
  <SessionProvider>
    <ClientExample />
  </SessionProvider>
  );
};

export default ClientPage;

```

### サーバーサイドでの使用法

**page.tsx**

```typescript
export default async function Page() {

  const session = await auth()

  return (
    <div className="space-y-2">
      <SessionData session={session}/>
    </div>
  );
}
```

**SessionData.tsx**

```typescript
import { Session } from "next-auth";

export default function SessionData({
  session
}:{
  session: Session | null
}) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <pre className="py-6 px-4 whitespace-pre-wrap break-all">
          {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}

```

## その他アプリ連携例

```typescript
export const config: NextAuthConfig = {
  providers: [
    // https://github.com/settings/apps
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // https://console.cloud.google.com/apis/credentials
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
    // https://developers.line.biz/console/
    LINE({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
      checks: ["state"], // これがないとエラーになってしまう。
    }),
  ],
  ...
```

## 各アプリで固有のIDを取得する方法

`providers`の`profile`で値の微調整を行う。  
その後、`jwt`->`session`と値が動くので、順に渡してあげる。  
型変換は無理やり。  

```typescript
import NextAuth, { NextAuthConfig } from "next-auth"; 
import Google from "next-auth/providers/google";
import LINE from "next-auth/providers/line"
import { User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";

interface ExtendedUser extends NextAuthUser {
  provider?: "go" | "li"
  rawId?: string;
}

export const config: NextAuthConfig = {
  providers: [
    // https://console.cloud.google.com/apis/credentials
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      profile(profile) {
        return {
          provider: "go",
          name: profile.name || profile.displayName,
          email: profile.email,
          image: profile.picture || profile.pictureUrl,
          rawId: profile.sub  // ユーザー固有のID
        };
      },
    }),
    // https://developers.line.biz/console/
    LINE({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      profile(profile) {
        return {
          provider: "li",
          name: profile.name || profile.displayName,
          email: profile.email,
          image: profile.picture || profile.pictureUrl,
          rawId: profile.sub  // ユーザー固有のID
        };
      },
      checks: ["pkce", "state"],
    }),
  ],
  basePath: "/api/auth",
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: ExtendedUser }) {
      if (user) {
        token.id = user.id;
        token.sub = user.rawId;
        token.provider = user.provider;
      }
      return token;
    },
    async session({ session, token }){
      if (token && session.user) {
        if (token.provider && token.sub){
          session.user.id = `${token.provider}_${token.sub}`
        }
      }
      return session;
    },
  }
}

// page.tsx等では下記のものを使用してログイン情報を取得・削除する
export const { handlers, auth, signIn, signOut } = NextAuth(config);
```