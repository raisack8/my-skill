## What is Next.js

HPより [Next.js](https://nextjs.org/docs)
> Next.js は、フルスタック Web アプリケーションを構築するための React フレームワークです。   
> React Components を使用してユーザー インターフェイスを構築し、  
> Next.js を追加機能と最適化に使用します。

**Next.js**...Reactのフレームワーク  
**フレームワーク**...ここではWebアプリを効率的に開発するため土台

## Next.jsとReactの違い（両者の共生について解説）

[Next.jsとReactの違い（両者の共生について解説）](https://kinsta.com/jp/blog/nextjs-vs-react/)

javascriptの開発力が、Reactのようなライブラリや、Next.jsのようなフレームワークが登場して高まった。

### Next.jsとは

Next.jsは2016年にVercel社からリリース。  
オープンソースのReactフレームワーク。  
例) Twitch、TikTok、Uberなど

### Reactとは

Reactは、動的なユーザーインターフェースの構築に便利なJavaScriptライブラリ。  
ウェブインターフェースだけでなく、React Nativeを使ってモバイルアプリケーションを構築することも可能  

### Next.jsとReactの比較

#### Startup

**Next.js**

```sh
npx create-next-app
```

**React**

```sh
npx create-react-app new-app
```

Next.jsがReactをベースにしている。 React < Next.js  
Next.jsではさらに一歩進んで、ルーティング、コード分割、プリレンダリング、APIサポートなどの機能をすぐに利用することができる。

以下、まとめ

> Next.jsは、パフォーマンスを向上させる構造とツールで、Reactの機能の強化に成功しています。  
ルーティング、コード分割、画像最適化などの機能がNext.jsに組み込まれており、  
開発の際に手動で設定する必要はありません。  
これらの機能により、Next.jsは使いやすい選択肢であり、  
すぐにその後のコーディングに着手することができます。  
Next.jsは、さまざまなレンダリングオプションを備えているため、  
サーバーサイドレンダリングアプリケーションや、  
静的生成とNode.jsサーバーサイドレンダリングを組み合わせたアプリケーションに適しています。  
また、最適化機能により、Next.jsはECのような高速性が要求されるサイトにも向いています。  
Reactは、堅牢なフロントエンドアプリケーションの作成と拡張を支援するJavaScriptライブラリです。  
また、その構文はわかりやすく、特にJavaScriptのバックグラウンドを持つ開発者にとっては有用です。  
さらに、アプリケーションで使用するツールやその設定方法を事細かにコントロールすることができます。