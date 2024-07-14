# Django

## はじめに

Djangoはオールインワンのツールなので、個人開発としてはあまり労力もなく最適なのでは？  
後は処理速度の問題

[Django 公式ドキュメント](https://docs.djangoproject.com/ja/5.0/)

## クイックスタート

**pip**
```sh
pip install django 
```

プロジェクトを開始する。
```sh
django-admin startproject mysite
```
アプリケーションを作成する。
```sh
cd mysite
python manage.py startapp polls
```

!!! Note
    アプリ...何かを行う Web アプリケーション  
    プロジェクト...特定のウェブサイトの構成とアプリのコレクション

実行
```sh
python manage.py runserver

# ホスト:ポートを指定しての起動は以下のようになるが、ホスト設定が別途必要
# python manage.py runserver 192.168.0.18:8001
```


1. **シリアライザの作成**:

   `testapp` 内に `serializers.py` ファイルを作成し、以下のようにシリアライザを定義します。

   ```python
   from rest_framework import serializers

   class TestSerializer(serializers.Serializer):
       data = serializers.CharField(max_length=100)
   ```

2. **ビューの作成**:

   `testapp` 内に `views.py` ファイルを作成し、以下のようにビューを定義します。

   ```python
    from rest_framework.views import APIView
    from rest_framework.response import Response
    from rest_framework import status
    
    class TestView(APIView):
        def get(self, request):
            return Response("GET OK")
    
        def post(self, request, *args, **kwargs):
            data = request.data['message']
            return Response(data)
   ```

3. **URLパターンの設定**:

   `testapp` 内の `urls.py` ファイルを作成し、ビューとURLを関連付けます。

   ```python
   from django.urls import path
   from .views import TestView

   urlpatterns = [
       path('api/test/', TestView.as_view(), name='test-api'),
   ]
   ```

4. **プロジェクトURL設定の更新**:

   プロジェクトの `urls.py` ファイルを編集して、アプリのURLをインクルードします。

   ```python
   from django.contrib import admin
   from django.urls import path, include

   urlpatterns = [
       path('admin/', admin.site.urls),
       path('', include('testapp.urls')),
   ]
   ```

5. **ブラウズ可能なAPIページを無効にする**:

   settings.py ファイル内で、REST_FRAMEWORK セクションに以下の設定を追加して、ブラウズ可能なAPIページを無効にします。


   ```python
    REST_FRAMEWORK = {
        'DEFAULT_RENDERER_CLASSES': (
            'rest_framework.renderers.JSONRenderer',
        ),
        'DEFAULT_PARSER_CLASSES': (
            'rest_framework.parsers.JSONParser',
        ),
    }
   ```
これにより、JSON形式のレスポンスだけが使用されるようになります。


6. **サーバーの起動**:

   以下のコマンドでDjango開発サーバーを起動します。

   ```bash
   python manage.py runserver
   ```

これで、`http://localhost:8000/api/test/` にアクセスすると、GETリクエストで「GET OK」と、POSTリクエストで送信したデータがそのまま返されるRESTful APIが作成されます。

この手順に従って、最小限のDjango REST frameworkアプリケーションを作成することができます。必要に応じてカスタマイズや拡張を行い、さまざまなAPIを実装することが可能です。


# Django側でCORS（Cross-Origin Resource Sharing）を許可するには

Django側でCORS（Cross-Origin Resource Sharing）を許可するには、`django-cors-headers` パッケージを使用して設定を行う方法が一般的です。以下の手順に従って設定を行ってみてください。

1. **`django-cors-headers` パッケージのインストール**:

   まず、Djangoプロジェクトに `django-cors-headers` パッケージをインストールします。

   ```bash
   pip install django-cors-headers
   ```

2. **設定の追加**:

   `settings.py` ファイル内で、`INSTALLED_APPS` に `'corsheaders'` を追加します。

   ```python
   INSTALLED_APPS = [
       # ...
       'corsheaders',
   ]
   ```

3. **ミドルウェアの追加**:

   `MIDDLEWARE` リスト内に、`CorsMiddleware` を `'corsheaders.middleware.CorsMiddleware'` の前に追加します。

   ```python
   MIDDLEWARE = [
       # ...
       'corsheaders.middleware.CorsMiddleware',
       # ...
   ]
   ```

4. **CORS設定のカスタマイズ**:

   `settings.py` ファイル内に、CORS設定を追加します。以下は基本的な例ですが、必要に応じて設定をカスタマイズできます。

   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",  # Reactアプリのアドレス（適宜変更してください）
   ]

   # 必要に応じて他のCORS設定を追加できます
   ```

5. **注意事項**:

   - `CORS_ALLOWED_ORIGINS` リストには、アクセスを許可するオリジン（ドメイン）を追加してください。
   - `http://localhost:3000` の部分は、Reactアプリのアドレスに合わせて変更してください。

これで、DjangoプロジェクトがCORSを許可し、指定したオリジンからのアクセスを受け入れるようになります。CORS設定を変更した後は、Djangoサーバーを再起動して設定が反映されることを忘れないでください。


# requirements.txt
```
asgiref==3.7.2
Django==4.2.4
django-cors-headers==4.2.0
djangorestframework==3.14.0
pytz==2023.3
sqlparse==0.4.4
typing_extensions==4.7.1
tzdata==2023.3
```
