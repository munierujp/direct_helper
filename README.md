# direct helper
direct helperは、ビジネス用チャットツール[direct](https://direct4b.com/ja/)に便利な機能を追加するユーザースクリプトです。

## 機能
### マルチビューのレスポンシブ化
選択状態に応じてマルチビューのカラム数を動的に変更します。

### メッセージ監視  
メッセージを監視してコンソールに出力します。

## インストール方法
### Tampermonkey
ユーティリティ画面で`tampermonkey_scripts.zip`ファイルをインポートしてください。

### その他
ググってください。

## 使用方法
### メッセージ監視 
#### 監視対象の指定
directを開いたとき、デフォルト監視トークが未読であれば、自動で監視します。  
それ以外のトークを監視したい場合は、トーク一覧から手動で開いてください。  
一度開いたトークは、ページがリロードされるまで監視し続けます。

#### メッセージの表示
監視対象のトークにメッセージが追加されると、コンソールに表示します。  
スタンプがある場合はimgタグとして表示するので、マウスオーバーでプレビューできます。

## 設定
directの環境設定画面から、各種設定を変更できます。  
設定値自体のキーやデフォルト値を変更したい場合、スクリプト内の定数を書き換えてください。

### ログ
#### 日付フォーマット
日付フォーマットには、以下のパターン文字を使用可能です。  
パターン文字はJavaの[DateTimeFormatter](https://docs.oracle.com/javase/jp/8/docs/api/java/time/format/DateTimeFormatter.html#patterns)に基いています。

|文字|内容|例：2016-01-01 01:01:01|例：2016-12-31 23:59:59|
|:-----|:-------------------|:---|:---|
|`yyyy`|年（4桁）|2016|2016|
|`yy`|年（2桁）|16|16|
|`MM`|月（2桁）|01|12|
|`M`|月（1～2桁）|1|12|
|`dd`|日（2桁）|01|31|
|`d`|日（1～2桁）|1|31|
|`e`|曜日（漢字）|金|土|
|`HH`|時（2桁）|01|23|
|`H`|時（1～2桁）|1|23|
|`mm`|分（2桁）|01|59|
|`m`|分（1～2桁）|1|59|
|`ss`|秒（2桁）|01|59|
|`s`|秒（1～2桁）|1|59|

#### カスタムログ
カスタムログには、以下のタグを使用可能です。

##### メッセージ監視開始文
|タグ|内容|
|:-------|:----------|
|`<time>`|監視開始日時|

##### トーク監視開始文
|タグ|内容|
|:-----------|:----------|
|`<talkId>`|トークID|
|`<talkName>`|トーク名|
|`<time>`|監視開始日時|

##### メッセージヘッダー
|タグ|内容|
|:-----------|:-------|
|`<talkId>`|トークID|
|`<talkName>`|トーク名|
|`<time>`|発言日時|
|`<userName>`|ユーザー名|

## 解説
### 設定の保存
ブラウザのローカルストレージ上にJSON形式で各種設定を保存しています。  
デフォルトのキーは`direct_helper_settings`です。

### 設定画面の描画
環境設定画面のDOMを書き換えることで、direct helper用の設定項目を追加しています。  
変更ボタンの挙動は、可能な限りオリジナルのものを再現しています。

### 設定項目の定義  
設定項目はソースコード上に定数オブジェクトとして定義しており、容易に追加可能な設計になっています。

### 日付フォーマット
日付文字列を生成する際、パターン文字を実際の値に置換しています。

### カスタムログ
各種文字列を生成する際、カスタムタグを実際の値に置換しています。

### メッセージ監視
MutationObserverによってDOMの変更を監視することで、新着メッセージを取得しています。

## コンタクト
* [GitHub](https://github.com/munierujp/direct_helper)
* [Twitter](http://twitter.com/munieru_jp)