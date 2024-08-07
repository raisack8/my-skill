# GCP

# Sheet API

プロジェクトを作成  
↓  
Google Sheet APIを有効にする  
↓  
「APIとサービスを有効にする」をクリック  
↓  
Google Drive APIを有効にする  


認証情報  
↓  
認証情報を作成  
↓  
サービスアカウントを作成  
↓  
ロール:「基本」>「編集者」  
↓  
先ほど作ったユーザーの「キー」>「新しい鍵を作成」> JsonでDL

JsonをPythonのワークディレクトリに入れておく

```
pip install gspread
pip install gspread-formatting
```

ドライブにフォルダを作り、DriveのURLの後ろの部分を控えておく  
jsonのclient_emailをコピー  
ドライブのフォルダを共有>先ほどのアドレスを追加、ロールは編集者で共有  

**シートの作成** 
```py
import gspread

# GCPのクライアント
gc = gspread.service_account(
    filename="spread-sheet.json"
)
# スプレッドシートオブジェクト
sh = gc.create(
    "sheat_name", # ファイル名
    folder_id = "DriveのフォルダID"
)
# 一つ目のシートを取得　
ws = sh.get_worksheet(0)
ws.update_acell("A1", 2014)

# → 「sheet_name」というスプレッドシートができ、A1に「2014」が書かれている
```

**シートの読み込み** 
```py
import gspread

# GCPのクライアント
gc = gspread.service_account(
    filename="spread-sheet.json"
)
# スプレッドシートオブジェクト
sh = gc.open(
    "sheat_name", # ファイル名
    folder_id = "DriveのフォルダID"
)
# 一つ目のシートを取得　
ws = sh.get_worksheet("Sheet_name") # シート名を指定
number = [[n, n + 100] for n in raige(1, 101)]
ws.update(range_name="A1:B100", values=numbers)
# → 既存のシートに値を書き込む
```
pandasを使うとよりDataFrameをそのまま使える
```py
ws = sh.get_worksheet("Sheet_name")
df = pd.DataFrame({
    "名前": ["斎藤", "山田", "田中"],
    "年齢": [35, 20, 56]
})
ws.update(
    [df.columns.values.tolist()] # カラム名の多重リスト
    + df.values.tolist() # 各行のデータの多重リスト
)
```

```py
# シートの内容を全て削除
ws.clear()
```

**シートの読み込み** 
```py
ws = sh.get_worksheet("Sheet_name") # シート名を指定
val = ws.acell("A1").value # セルを指定して値を取得

row_2 = ws.row_values(2) # 2行目のデータを全て取得
col_2 = ws.col_values(2) # 2列目のデータを全て取得

all_values = ws.get_all_values() # 全てのデータを取得

df = pd.DataFrame(ws.get_all_record()) # シートのデータをDataFrameで取得
```

**シートの追加** 
```py
sh = gc.open(
    "sheat_name", # ファイル名
    folder_id = "DriveのフォルダID"
)
ws = sh.add_worksheet(
    title="シートのタイトル",
    rows=100,
    cols=20
)
```


**シートの削除** 
```py
sh = gc.open(
    "sheat_name", # ファイル名
    folder_id = "DriveのフォルダID"
)
ws = sh.get_worksheet("シートのタイトル")
sh.del_worksheet(ws)
```

**書式の変更** 
```py
ws = sh.get_worksheet("シートのタイトル")
# A1:B1の文字がbold
ws.format("A1:B1",{
    "textFormat": {"bold": True}
    }
)
# A1:B1の文字がboldで、フォントサイズが15で、中央寄せ
ws.format("A1:B1",{
    "textFormat": {
        "bold": True,
        "fontSize": 15
        }
    },
    "horizontalAlignment": "CENTER" # 左寄せ: LEFT, 右寄せ: RIGHT
)
```

**罫線を引く** 
```py
import gspread
from gspread_formatting import (
    Border, Color, CellFormat, Borders, format_cell_range
)

ws = sh.get_worksheet("シートのタイトル")
# 罫線の種類を定義する: 実線, 赤, 太さ1
b = Border("SOLID", Color(1, 0, 0), width=1)
# どのような罫線を引くか: 上下左右
fmt = CellFormat(
    borders=Borders(
        top=b,
        botton=b,
        left=b,
        right=b,
    )
)
# どこに罫線を引くか
format_cell_rangfe(ws, "A1:B1", fmt)
```