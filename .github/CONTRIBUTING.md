# 開発方法
## 環境構築
[Node.js](https://nodejs.org/en/)をインストールしてください。

## コマンド
```sh
# install gulp-cli, bower
$ npm install -g gulp-cli bower

# install npm packages
$ npm install

# install bower packages
$ bower install

# watch file changes
$ npm run watch

# build app
$ npm run build
```

## 外部ライブラリ
以下の外部ライブラリを使用しています。  
ライブラリの詳細は各ライブラリのドキュメントを参照してください。

* [Optional.js](https://github.com/munierujp/Optional.js)
* [Observer.js](https://github.com/munierujp/Observer.js)
* [Replacer.js](https://github.com/munierujp/Replacer.js)
* [SuperMap.js](https://github.com/munierujp/SuperMap.js)

## 設定
Chromeの同期ストレージ上にJSON形式で設定を保存しています。

### 仕様
以下の仕様に沿って定義することで、設定関連処理（設定画面の描画、設定値の保存、機能の実行）を自動的に行ないます。

#### settingData
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
|experiment|Boolean|-|実験機能フラグ|
|parentKey|String|-|親キー|
|buttons|Object[]|-|ラジオボタン|

### button
|プロパティ|型|必須|内容|
|---|---|---|---|
|key|String|○|キー|
|name|String|○|名前|
|description|String|-|説明|

## ファイル構成
[Chrome Extension generator](https://github.com/yeoman/generator-chrome-extension)で生成したファイルをもとにしています。  
テンプレートと大きく異なるのは、[webpack](https://webpack.js.org/)を用いている点です。

* `/.github/`  
GitHub用ファイルを配置。
* `/app/`  
拡張機能用ファイルを配置。
* `/app/_locales/`  
言語ファイルを配置。
* `/app/images/`  
画像ファイルを配置。
* `/app/scripts.babel/`  
スクリプトファイルを配置。
* `/app/scripts.babel/actions/`  
機能に対応するスクリプトファイルを配置。
* `/app/scripts.babel/classes/`  
クラスのスクリプトファイルを配置。
* `/app/scripts.babel/constants/`  
定数のスクリプトファイルを配置。
* `/app/scripts.babel/constants/actions.js`  
機能を定義するスクリプトファイル。
* `/app/scripts.babel/constants/settingData.js`  
設定項目を定義するスクリプトファイル。
* `/app/scripts.babel/enums/`  
列挙のスクリプトファイルを配置。
* `/app/scripts.babel/functions/`  
関数のスクリプトファイルを配置。
* `/app/scripts.babel/views/`  
画面描画用のスクリプトファイルを配置。
* `/app/scripts.babel/main.js`  
メインのスクリプトファイル。
* `/app/manifest.json`  
拡張機能の定義ファイル。
* `/app/popup.html`  
拡張機能のアイコンをクリック時に表示される画面。
* `/doc/`  
ドキュメント用ファイルを配置。
* `/bower.json`  
bowerのパッケージ情報定義ファイル。
* `/gulpfile.babel.js`  
gulpのタスク定義ファイル。
* `/package.json`  
npmのパッケージ情報定義ファイル。
* `/webpack.config.js`  
webpackの設定定義ファイル。
