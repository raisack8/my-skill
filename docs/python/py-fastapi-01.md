# FastAPI

## はじめに

FastAPIはDjangoと異なり必要ものだけを取り入れてデプロイすることができる。  
Djangoでいうと、コマンド一つでマイグレーション機能やDBのORM、ルーターや管理画面など、ありとあらゆるツールを提供してくれ、非常に便利だが、その反面多少重い。  
FastAPIは必要なものを必要な時だけインストールすればいいので、余計なライブラリは省くことができる。  
例えばDBが使いたいときは`SQL Alchemy`を、マイグレーション機能を使うには`Alembic`を、インストールすればよい。  
Djangoではそれらのツールを簡単に使えるのに対して、FastAPIは一からそれらを構築する必要があり、取得レベルとしては多少高くなる。  
ここでは、そのFastAPIをまとめる。

## クイックスタート

私がよく使う最小限のライブラリは`fastapi`、`sqlalchemy`、`uvicorn`となり、それらをインストールした後の`requirements.txt`は以下のようになる。

**requirements.txt**
```txt
annotated-types==0.6.0
anyio==3.7.1
click==8.1.7
colorama==0.4.6
exceptiongroup==1.2.0
fastapi==0.105.0
greenlet==3.0.3
h11==0.14.0
idna==3.6
pydantic==2.5.3
pydantic_core==2.14.6
sniffio==1.3.0
SQLAlchemy==2.0.23
starlette==0.27.0
typing_extensions==4.9.0
```

下記エンドポイントをmain.pyに作成してみる。  
GETリクエストを受け取ったら文字列を返すだけ。  
**main.py**
```py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
```
仮想環境を作成してサーバーを起動
```sh
uvicorn main:app --reload
```

!!! Note
    `--reload`をオプションに指定することでホットリロードで実行することができる。

ホストやポートを指定したい場合は以下
```sh
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Pydantic

タイプアノテーションで使う。リクエストの型などを判定することができる。
```py
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/")
def read_root(
    name: str = Query(
        ..., 
        title="人の名前", 
        description="このパラメータでは人の名前を取得します。", 
        example="Yoko"
    ),
):
    return {"Hello": name}
```
`localhost:8000/?name=Takeru`で`Takeru`という文字列を受け取ることができる。

どちらかの型を許容する
```py
from typing import Union
...
user_id: Union[str, None]
```
必須チェックなし
```py
user_id: str | None = None
```
独自の型を宣言する場合
```py
from pydantic import BaseModel

class PersonalData(BaseModel):
    name: str = ""
    age: int = 0

@app.get("/")
def read_root(
    data: PersonalData
):
    return {"Hello": data.name, "age": data.age}
```
特定の文字列しか許容しない場合
```py
class FruitEnum(str, Enum):
    APPLE = "Apple"
    BANANA = "Banana"
    GRAPE = "Grape"
    ORANGE = "Orange"

class UserData(BaseModel):
    Fruit: FruitEnum = Field(...
```

[FastAPI
クエリパラメータと文字列の検証](https://fastapi.tiangolo.com/ja/tutorial/query-params-str-validations/)

`BaseModel`により一層の情報を付与する
```py
from pydantic import BaseModel, Field

class User(BaseModel):
    name: str = Field(
        ..., # 必須:"..." , Optional: "None"
        default="Takeshi",
        description="男の子の名前",
        examples="Yuto"
    )
    phone: str = Field(
        ...,
        max_length=13, # 最大文字列も設定可能
        pattern=r"^\d{3}-\d{4}-\d{4}$" # パラメータのバリデーションチェックも可能
    )

```

以下のように`response_model`を定義することによって、レスポンスの型を定義することができる。

```py
@app.get(
    "/",
    response_model=User
    )
def read_root(
    data: PersonalData
):
    return {"name": name, "phone": phone}
```

## DB設定

以下を作成し、main.pyでimportすればDB操作ができる。
**database.py**
```py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./data.db"
# PostgreSQLを使う場合は下を使う
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

この`get_db()`をmain.pyで呼び出し、リクエストを受け取った際に`Session`を作成する。

```py
from fastapi import Depends
from sqlalchemy.orm import Session
from ..models.database import get_db # dir構成次第

@app.get("/")
def read_root(
    db: Session = Depends(get_db),
):
    data = DbClient(db) # 例) DBに接続して特定の値を取得
    return {"data": data}
```

## API Router

処理の種類に応じて別モジュールにエンドポイントを定義することができる。  
**main.py**
```py
from fastapi import FastAPI
from src.apis import user

app = FastAPI()

app.include_router(user.router, tags=["user"])
```

**src/apis/user.py**
```py
from fastapi import APIRouter, Header, Depends

router = APIRouter()

top_level = "user"

@router.post(
    f"/{top_level}/info",
    name="ユーザー情報取得API",
    description="Headerのx_user_idを読み取ってユーザー情報を返す",
)
def post_user_info(
    db: Session = Depends(get_db),
    # フロントで"headers"に設定された値を取得する
    x_user_id: Union[str, None] = Header(None, alias="x-key"),
):
    ...
```

## SQL Alchemy

### BaseModel

**src/models/base.py**
```py
from datetime import datetime

from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declared_attr


class OrgBaseModel(object):
    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=datetime.now, nullable=False)

    @declared_attr
    def updated_at(cls):
        return Column(
            DateTime, default=datetime.now, onupdate=datetime.now, nullable=False
        )

```

**src/models/t_user.py**
```py
from sqlalchemy import UUID, Boolean, Column, Integer, String

from .base import OrgBaseModel
from .database import Base, engine


class TUser(Base, OrgBaseModel):
    __tablename__ = "t_user"

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    icon_type = Column(Integer, default=1, nullable=False
        comment"0: ユーザーアイコン, 1: トップアイコン")
    uuid = Column(UUID, index=True, nullable=False)

# DBに接続して、このテーブルが存在していなかったらテーブルをCREATEする処理
Base.metadata.create_all(bind=engine, checkfirst=True)
```

### CRUD

#### create
```py
from typing import Union

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.m_item import MItem


class MItemCrud:
    def insert_m_item(
        db: AsyncSession,
        name: str,
    ) -> Union[MItem, None]:
        try:
            item = MItem(
                name=name,
            )
            db.add(item)
            db.commit()
            return item
        except Exception as e:
            logger.error(e)
            db.rollback()
            return None
```

#### read
```py
from typing import Union

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.m_item import MItem


class MItemCrud:
    def select_m_item_by_id(
        db: AsyncSession,
        index: int,
    ) -> Union[MItem, None]:
        try:
            result = (
                db.query(MItem)
                .filter(
                    MItem.id == index,
                )
                .first()
            )
            return result
        except Exception as e:
            logger.error(e)
            db.rollback()
            return None
```

#### update
```py
from typing import Union
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.t_user import TUser
from ..repositories.type import UserBaseInfoType

class TUserCrud:
    def update_t_user(
        db: AsyncSession, data: UserBaseInfoType, user_id: str
    ) -> Union[TUser, None]:
        try:
            user = db.query(TUser).filter(TUser.uuid == UUID(user_id)).first()
            user.name = data.name
            db.commit()
            return user
        except Exception as e:
            logger.error(e)
            db.rollback()
            return None
```


#### delete
```py
from typing import Union
from uuid import UUID, uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.t_user_material_bag import TUserMaterialBag

class TUserMaterialBagCrud:
    def delete_t_user_material_bag(
        db: AsyncSession,
        item_id: int,
        uuid: str,
    ) -> Union[TUserMaterialBag, None]:
        try:
            item = (
                db.query(TUserMaterialBag).first()
            )
            db.delete(item)
            db.commit()
            return item
        except Exception as e:
            logger.error(e)
            db.rollback()
            return None
```

#### upsert
```py
from typing import Union

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.m_item import MItem


class MItemCrud:
    def updata_m_item(db, data):
        try:
            items_to_update_or_create = []
            for item_data in data:
                item = db.query(MItem).filter_by(id=item_data["id"]).first()
                if item:
                    # 既存のアイテムを更新
                    item.name = item_data["name"]
                else:
                    # 新しいアイテムを追加
                    item = MItem(**item_data)
                items_to_update_or_create.append(item)
            db.bulk_save_objects(items_to_update_or_create)
            db.commit()
        except Exception as e:
            logger.error(e)
            db.rollback()
            return None
```

## main.py テンプレ

```py
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.apis import act, websocket
from src.common.logger import logger

app = FastAPI()

target_host = "192.168.0.20"
target_port_front = 3000
target_port_ws = 8000 # WebSocket用のポート

origins = [
    f"http://{target_host}:{target_port_ws}",
    f"http://{target_host}:{target_port_front}",
]

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def handler(request: Request, exc: RequestValidationError):
    logger.error(request.headers)
    logger.error(exc)
    return JSONResponse(content={}, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

app.include_router(act.router, tags=["act"])
app.include_router(websocket.router, tags=["websocket"])
```

## WebSocket用エンドポイントテンプレ

```py
import json

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from ..common.response import get_user_id
from ..crud.t_chat_message import TChatMessageCrud
from ..crud.t_user import TUserCrud
from ..models.database import get_db
from ..repositories.type import ChatPostType

router = APIRouter()

top_level = "ws"


@router.websocket(f"/{top_level}/chat")
async def websocket_endpoint(
    websocket: WebSocket,
    db: Session = Depends(get_db),
):
    await websocket.accept()
    try:
        while True:
            # websocketからpostされてきたデータをテキストで取得
            data_text = await websocket.receive_text()
            # jsonに変換
            data = json.loads(data_text)
            # DB操作の為型に当てはめる
            user_id = get_user_id(data["key"])
            chat_data = ChatPostType(
                message=data["message"],
                color=int(data["color"]),
                mention={
                    "user_name": data["mention"]["user_name"],
                    "open_user_id": data["mention"]["open_user_id"],
                },
            )

            # 登録して登録したものを返す
            user = TUserCrud.select_t_user_by_uuid(db, user_id)
            chat = TChatMessageCrud.insert_t_chat_message(db, user_id, chat_data, user)
            data = {
                "user_name": chat.user_name,
                "message": chat.message,
                "open_user_id": chat.open_user_id,
                "created_at": chat.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            }
            await websocket.send_text(
                json.dumps(
                    {
                        "code": 200,
                        "message": "WebSocket",
                        "data": {"chats": data, "open_id": user.open_user_id},
                    }
                )
            )
    except WebSocketDisconnect:
        print("WebSocket connection closed")
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()
```

## user_id暗号化テンプレ

**response.py**
```py
from fastapi import Header

from .code import Code


def get_user_id(x_key: str = Header(None, alias="x-key")):
    """
    ヘッダーから暗号化されたユーザーIDを取得し、
    復号化して返す。
    復号できなかったら認証エラーを返す
    """
    if x_key == "" or x_key == None:
        return ""
    else:
        try:
            decrypted_message = Code.decrypt_message(x_key)
            return decrypted_message
        except:
            return ""
```

パスワードベース暗号化  
**code.py**
```py
import base64

from cryptography.fernet import Fernet
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from fastapi import HTTPException

from .const import CODE_PASSPHRASE


class Code:
    # 暗号化関数
    def encrypt_message(message: str) -> bytes:
        key = Code.generate_key_from_passphrase(CODE_PASSPHRASE)
        fernet = Fernet(key)
        return str(fernet.encrypt(message.encode()))[2:-1]

    # 復号化関数
    def decrypt_message(encrypted_message: bytes) -> str:
        try:
            key = Code.generate_key_from_passphrase(CODE_PASSPHRASE)
            fernet = Fernet(key)
            return fernet.decrypt(encrypted_message.encode("utf-8")).decode("utf-8")
        except Exception as e:
            raise HTTPException(
                status_code=400, detail="Invalid encryption or corrupted data"
            )

    # パスフレーズからキーを生成する関数
    def generate_key_from_passphrase(passphrase: str) -> bytes:
        passphrase = passphrase.encode()  # パスフレーズをbytes型に変換
        salt = (
            b"salt_"  # セキュリティ向上のためのソルト（実際にはランダムな値を使うべき）
        )
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=390000,
            backend=default_backend(),
        )
        key = base64.urlsafe_b64encode(kdf.derive(passphrase))  # 安全な鍵を生成
        return key
```