# 開発方法
`direct_helper.user.js`がスクリプトの本体です。  
JavaScript/jQueryでコードを記述してください。

## 外部ライブラリ
以下の外部ライブラリを使用しています。  
ライブラリの詳細は各ライブラリのドキュメントを参照してください。

* [Optional.js](https://github.com/munierujp/Optional.js)
* [Observer.js](https://github.com/munierujp/Observer.js)
* [Replacer.js](https://github.com/munierujp/Replacer.js)
* [SuperMap.js](https://github.com/munierujp/SuperMap.js)

## 関数
機能に対応する関数の名前は、`doExpandUserIcon`のように`do[設定キー]`で統一しています。  
定数オブジェクト`SETTINGS_KEY_ACTIONS`にプロパティを追加することで、その設定がオン（`true`）のときに関数を実行します。

## 設定
ブラウザのローカルストレージ上にJSON形式で設定を保存しています。  
キーは`direct_helper_settings`です。

### 仕様
設定項目はソースコード上に定数オブジェクト`SETTING_DATA`として定義しています。  
以下の仕様に沿って定義することで、設定関連処理（設定画面の描画、設定値の保存、機能の実行）を自動的に行ないます。

#### SETTING_DATA
|プロパティ|型|必須|内容|
|---|---|---|---|
|name|String|○|名前|
|description|String|○|説明|
|sections|Object[]|○|設定セクション|

#### section
|プロパティ|型|必須|内容|
|---|---|---|---|
|key|String|○|キー|
|name|String|○|名前|
|description|String|-|説明|
|items|Object[]|-|設定アイテム|

#### item
|プロパティ|型|必須|内容|
|---|---|---|---|
|key|String|○|キー|
|name|String|○|名前|
|description|String|-|説明|
|type|FormType|○|フォーム種別|
|default|?|○|デフォルト値|
|parentKey|String|-|親キー|
|buttons|Object[]|-|ラジオボタン|

### button
|プロパティ|型|必須|内容|
|---|---|---|---|
|key|String|○|キー|
|name|String|○|名前|
|description|String|-|説明|
