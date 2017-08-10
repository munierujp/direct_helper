// ==UserScript==
// @name         direct helper
// @namespace    https://github.com/munierujp/direct_helper
// @version      1.3
// @description  directに便利な機能を追加します。
// @author       Munieru
// @match       https://*.direct4b.com/home*
// @grant        none
// ==/UserScript==

(function(){
    'use strict';

    /** オプショナル */
    class Optional{
        /**
        * 引数の値を含むオプショナルを生成します。
        * @param {Object} value 値
        * @return {Optional} オプショナル
        */
        constructor(value){
            this.value = value;
        }

        /**
        * 空のオプショナルを生成します。
        * @return {Optional} 空のオプショナル
        */
        static empty(){
            return new this(null);
        }

        /**
        * 引数の値がnullまたはundefinedではない場合はその値を含むオプショナルを生成します。
        * それ以外の場合は例外をスローします。
        * @param {Object} value 値
        * @return {Optional} オプショナル
        * @throws {Error} valueがnullまたはundefinedの場合
        */
        static of(value){
            if(value === null || value === undefined){
                throw new Error("value is null or undefined");
            }
            return new this(value);
        }

        /**
        * 引数の値がnullまたはundefinedではない場合はその値を含むオプショナルを生成します。
        * それ以外の場合は空のオプショナルを返します。
        * @param {Object} value 値
        * @return {Optional} オプショナル
        */
        static ofAbsentable(value){
            return (value !== null && value !== undefined) ? this.of(value) : Optional.empty();
        }

        /**
        * オプショナルの中身が存在する場合は引数の関数を実行し、trueの場合は自身を返します。
        * それ以外の場合は空のオプショナルを返します。
        * @param {Function} matcher : value => Boolean
        * @return {Optional} オプショナル
        */
        filter(matcher){
            return (this.isPresent() && matcher(this.value)) ? this : Optional.empty();
        }

        /**
        * オプショナルの中身が存在する場合は引数の関数を実行し、新しい中身からなるオプショナルを生成します。
        * それ以外の場合は空のオプショナルを返します。
        * @param {Function} mapper : value => newValue
        * @return {Optional} オプショナル
        */
        map(mapper){
            return this.isPresent() ? Optional.ofAbsentable(mapper(this.value)) : Optional.empty();
        }

        /**
        * オプショナルの中身が存在する場合は引数の関数を実行し、結果を返します。
        * それ以外の場合は空のオプショナルを返します。
        * @param {Function} mapper : value => newValue
        * @return {Optional} オプショナル
        */
        flatMap(mapper){
            return this.isPresent() ? mapper(this.value) : Optional.empty();
        }

        /**
        * オプショナルの中身が存在する場合は引数の関数を実行し、自身を返します。
        * それ以外の場合はそのまま自身を返します。
        * @param {Function} processer : value => {...}
        * @return {Optional} 自身
        */
        ifPresent(processer){
            if(this.isPresent()){
                processer(this.value);
            }
            return this;
        }

        /**
        * オプショナルの中身が存在しない場合は引数の関数を実行し、自身を返します。
        * それ以外の場合はそのまま自身を返します。
        * @param {Function} processer : () => {...}
        * @return {Optional} 自身
        */
        ifAbsent(processer){
            if(this.isAbsent()){
                processer();
            }
            return this;
        }

        /**
        * オプショナルの中身が存在する場合はそれを返します。
        * それ以外の場合は例外をスローします。
        * @return {Object} オプショナルの中身
        * @throws {Error} オプショナルの中身が空の場合
        */
        get(){
            if(this.isAbsent()){
                throw new Error("this is empty");
            }
            return this.value;
        }

        /**
        * オプショナルの中身が存在する場合はそれを返します。
        * それ以外の場合は引数の値を返します。
        * @param {Object} other 値
        * @return {Object} オプショナルの中身
        */
        orElse(other){
            return this.isPresent() ? this.value : other;
        }

        /**
        * オプショナルの中身が存在する場合はそれを返します。
        * それ以外の場合は引数の関数を実行した結果を返します。
        * @param {Function} getter : () => other
        * @return {Object} オプショナルの中身
        */
        orElseGet(getter){
            return this.isPresent() ? this.value : getter();
        }

        /**
        * オプショナルの中身が存在する場合はそれを返します。
        * それ以外の場合は引数の関数を実行した結果をスローします。
        * @param {Function} supplier : () => Error
        * @return {Object} オプショナルの中身
        * @throws {Error} オプショナルの中身が空の場合
        */
        orElseThrow(supplier){
            if(this.isAbsent()){
                throw supplier();
            }
            return this.value;
        }

        /**
        * オプショナルの中身が存在するかどうかを判定します。
        * @return {Boolean} 中身が存在すればtrue、存在しなければfalse
        */
        isPresent(){
            return this.value !== null && this.value !== undefined;
        }

        /**
        * オプショナルの中身が存在しないかどうかを判定します。
        * @return {Boolean} 中身が存在しなければtrue、存在すればfalse
        */
        isAbsent(){
            return this.value === null || this.value === undefined;
        }

        /**
        * オプショナルの中身と引数のオプショナルの中身が等しいかどうかを判定します。
        * @param {Optional} other 他のオプショナル
        * @return {Boolean} 等しければtrue、等しくなければfalse
        */
        equals(other){
            return other instanceof Optional && this.value === other.value;
        }
    }

    /** イテレーター */
    class Iterator{
        /**
        * 引数のオブジェクトからイテレーターを生成します。
        * @param {Object} object オブジェクト
        * @return {Iterator} イテレーター
        */
        constructor(object){
            this.object = object;
        }

        /**
        * 空のイテレーターを生成します。
        * @return {Iterator} 空のイテレーター
        */
        static empty(){
            return new this(null);
        }

        /**
        * 引数のオブジェクトからイテレーターを生成します。
        * @param {Object} object オブジェクト
        * @return {Iterator} イテレーター
        */
        static of(object){
            return new this(object);
        }

        /**
        * 引数の関数を各要素に対して一度ずつ実行し、自身を返します。
        * @param {Function} processer : (key, value) => {...}
        * @return {Iterator} 自身
        */
        peek(processer){
            this.forEach(processer);
            return this;
        }

        /**
        * 引数の関数を各要素に対して一度ずつ実行し、条件を満たす要素からなるイテレーターを生成します。
        * @param {Function} matcher : (key, value) => Boolean
        * @return {Iterator} 条件を満たす要素からなるイテレーター
        */
        filter(matcher){
            if(this.isEmpty()){
                return this;
            }
            const filtered = {};
            Object.keys(this.object)
                .filter(key => matcher(key, this.object[key]))
                .forEach(key => filtered[key] = this.object[key]);
            return Iterator.of(filtered);
        }

        /**
        * 引数の関数を各要素のキーに対して一度ずつ実行し、新しい要素からなるイテレーターを生成します。
        * @param {Function} keyMapper : (key, value) => newKey
        * @return {Iterator} 新しい要素からなるイテレーター
        */
        key(keyMapper){
            return this.map(keyMapper, (key, value) => value);
        }

        /**
        * 引数の関数を各要素の値に対して一度ずつ実行し、新しい要素からなるイテレーターを生成します。
        * @param {Function} valueMapper : (key, value) => newValue
        * @return {Iterator} 新しい要素からなるイテレーター
        */
        value(valueMapper){
            return this.map((key, value) => key, valueMapper);
        }

        /**
        * 引数の関数を各要素に対して一度ずつ実行し、新しい要素からなるイテレーターを生成します。
        * @param {Function} keyMapper : (key, value) => newKey
        * @param {Function} valueMapper : (key, value) => newValue
        * @return {Iterator} 新しい要素からなるイテレーター
        */
        map(keyMapper, valueMapper){
            if(this.isEmpty()){
                return this;
            }
            const mapped = {};
            Object.keys(this.object)
                .forEach(key => mapped[keyMapper(key, this.object[key])] = valueMapper(key, this.object[key]));
            return Iterator.of(mapped);
        }

        /**
        * 引数の関数を各要素に対して一度ずつ実行します。
        * @param {Function} processer : (key, value) => {...}
        */
        forEach(processer){
            if(this.isNotEmpty()){
                Object.keys(this.object)
                    .forEach(key => processer(key, this.object[key]));
            }
        }

        /**
        * イテレーターの中身を取得します。
        * @return {Object} イテレーターの中身
        */
        get(){
            return this.object;
        }

        /**
        * イテレーターの中身のキー配列を返します。
        * 要素が空の場合、空の配列を返します。
        * @return {Object[]} イテレーターの中身のキー配列
        */
        keys(){
            return this.isNotEmpty() ? Object.keys(this.object) : [];
        }

        /**
        * イテレーターの中身の値配列を返します。
        * 要素が空の場合、空の配列を返します。
        * @return {Object[]} イテレーターの中身の値配列
        */
        values(){
            return this.isNotEmpty() ? Object.values(this.object) : [];
        }

        /**
        * 引数の条件を満たす要素のキーを返します。
        * 条件を満たす要素がない場合、undefinedを返します。
        * @param {Function} matcher : (key, value) => Boolean
        * @return {Object} 引数の条件を満たす要素があればその値、なければundefined
        */
        findKey(matcher){
            if(this.isNotEmpty()){
                for(const key in this.object){
                    if(matcher(key, this.object[key])){
                        return key;
                    }
                }
            }
            return undefined;
        }

        /**
        * 引数の条件を満たす要素の値を返します。
        * 条件を満たす要素がない場合、undefinedを返します。
        * @param {Function} matcher : (key, value) => Boolean
        * @return {Object} 引数の条件を満たす要素があればそのキー、なければundefined
        */
        find(matcher){
            if(this.isNotEmpty()){
                for(const key in this.object){
                    if(matcher(key, this.object[key])){
                        return this.object[key];
                    }
                }
            }
            return undefined;
        }

        /**
        * いずれかの要素が引数の条件を満たすかどうかを判定します。
        * 要素が空の場合、falseを返します。
        * @param {Function} matcher : (key, value) => Boolean
        * @return {Boolean} いずれかの要素が条件を満たせばtrue、それ以外はfalse
        */
        some(matcher){
            if(this.isNotEmpty()){
                for(const key in this.object){
                    if(matcher(key, this.object[key])){
                        return true;
                    }
                }
            }
            return false;
        }

        /**
        * すべての要素が引数の条件を満たすかどうかを判定します。
        * 要素が空の場合、trueを返します。
        * @param {Function} matcher : (key, value) => Boolean
        * @return {Boolean} すべての要素が条件を満たせばtrue、それ以外はfalse
        */
        every(matcher){
            if(this.isNotEmpty()){
                for(const key in this.object){
                    if(!matcher(key, this.object[key])){
                        return false;
                    }
                }
            }
            return true;
        }

        /**
        * 要素が空であるかどうかを判定します。
        * @return {Boolean} 要素が空であればtrue、それ以外はfalse
        */
        isEmpty(){
            return this.object === null || this.value === undefined;
        }

        /**
        * 要素が空ではないかどうかを判定します。
        * @return {Boolean} 要素が空でなければtrue、それ以外はfalse
        */
        isNotEmpty(){
            return this.value !== null && this.value !== undefined;
        }
    }

    /** 値保持クラス */
    class HasValue{
        /**
        * @param {Object} value 値
        */
        constructor(value){
            this.value = value;
        }
    }

    /** ディスプレイ種別クラス */
    class DisplayType extends HasValue{}
    /** ディスプレイ種別 */
    const DisplayTypes = {
        BLOCK: new DisplayType("block"),
        FLEX: new DisplayType("flex"),
        INLINE: new DisplayType("inline"),
        NONE: new DisplayType("none")
    };

    /** 要素種別クラス */
    class ElementType extends HasValue{}
    /** 要素種別 */
    const ElementTypes = {
        BUTTON: new ElementType("button"),
        DIV: new ElementType("div"),
        HR: new ElementType("hr"),
        IMG: new ElementType("img"),
        INPUT: new ElementType("input"),
        LABEL: new ElementType("label"),
        SPAN: new ElementType("span")
    };

    /** イベント種別クラス */
    class EventType extends HasValue{}
    /** イベント種別 */
    const EventTypes = {
        CLICK: new EventType("click"),
        INPUT: new EventType("input")
    };

    /** フォーム種別クラス */
    class FormType{}
    /** フォーム種別 */
    const FormTypes = {
        CHECKBOX: new FormType(),
        TEXT: new FormType(),
        TEXT_ARRAY: new FormType()
    };

    /** メッセージ種別クラス */
    class MessageType extends HasValue{}
    /** メッセージ種別 */
    const MessageTypes = {
        FILE: new MessageType("msg-text-contained-thumb"),
        IMAGE: new MessageType("thumb-cover"),
        STAMP: new MessageType("stamp"),
        STAMP_AND_TEXT: new MessageType("stamp-with-text"),
        TEXT: new MessageType("msg-text")
    };

    /** 監視モードクラス */
    class ObserveMode extends HasValue{}
    /** 監視モード */
    const ObserveModes = {
        ATTRIBUTES: new ObserveMode({attributes: true}),
        CHILD_LIST: new ObserveMode({childList: true})
    };

    /** ユーザー種別クラス */
    class UserType extends HasValue{}
    /** ユーザー種別 */
    const UserTypes = {
        ME: new UserType("my-msg"),
        OTHERS: new UserType("your-msg"),
        SYSTEM: new UserType("system-msg")
    };

    /** enumリスト */
    const ENUMS = [
        DisplayTypes,
        ElementTypes,
        EventTypes,
        FormTypes,
        MessageTypes,
        ObserveModes,
        UserTypes
    ];
    //enumを深く凍結
    ENUMS.forEach(e => deepFreeze(e));

    /** id属性接頭辞 */
    const HTML_ID_PREFIX = "direct_helper-";

    /** ローカルストレージ設定キー */
    const LOCAL_STORAGE_SETTINGS_KEY = "direct_helper_settings";

    /** 設定画面説明 */
    const SETTING_DESCRIPTION = "以下はdirect helperの設定です。設定変更後はページをリロードしてください。";

    /** ユーザーダイアログ設定データ */
    const USER_DIALOG_SETTING_DATA = {
        key: "user-dialog-settings",
        title: "ユーザーダイアログ",
        description: "ユーザーダイアログの動作を変更します。",
        inputKeyDatas: {
            expand_user_icon: {
                type: FormTypes.CHECKBOX,
                key: "expand_user_icon",
                name: "ユーザーアイコンの拡大",
                default: true,
                description: "ユーザーアイコンをクリックで拡大表示します。"
            }
        }
    };

    /** メッセージ入力設定データ */
    const INPUT_MESSAGE_SETTING_DATA = {
        key: "input-message-settings",
        title: "メッセージ入力",
        description: "メッセージ入力欄の動作を変更します。",
        inputKeyDatas: {
            show_message_count: {
                type: FormTypes.CHECKBOX,
                key: "show_message_count",
                name: "入力文字数の表示",
                default: true,
                description: "入力文字数をカウントダウン形式で表示します。"
            }
        }
    };

    /** マルチビュー設定データ */
    const MULTI_VIEW_SETTING_DATA = {
        key: "multi-view-settings",
        title: "マルチビュー",
        description: "マルチビューの動作を変更します。",
        inputKeyDatas: {
            responsive_multi_view: {
                type: FormTypes.CHECKBOX,
                key: "responsive_multi_view",
                name: "マルチビューのレスポンシブ化",
                default: true,
                description: "選択状態に応じてマルチビューのカラム数を動的に変更します。"
            }
        }
    };

    /** メッセージ監視設定データ */
    const WATCH_MESSAGE_SETTING_DATA = {
        key: "message-watching-settings",
        title: "メッセージ監視",
        description: "メッセージを監視してコンソールに出力します。",
        inputKeyDatas: {
            watch_message: {
                type: FormTypes.CHECKBOX,
                key: "watch_message",
                name: "メッセージの監視",
                default: true,
                description: "メッセージを監視してコンソールに出力します。"
            },
            show_past_message: {
                type: FormTypes.CHECKBOX,
                key: "show_past_message",
                name: "過去メッセージの表示",
                default: false,
                description: "監視開始以前のメッセージを表示します。"
            },
            watch_default_observe_talk: {
                type: FormTypes.CHECKBOX,
                key: "watch_default_observe_talk",
                name: "デフォルト監視対象の自動監視",
                default: true,
                description: "デフォルト監視トークIDで指定したトークが未読であれば、自動で監視します。"
            },
            default_observe_talk_ids: {
                type: FormTypes.TEXT_ARRAY,
                key: "default_observe_talk_ids",
                name: "デフォルト監視トークID",
                default: [],
                description: 'HTMLのid属性のうち、"talk-_"で始まるものを半角カンマ区切りで入力してください。'
            }
        }
    };

    /** ログ設定データ */
    const LOG_SETTING_DATA = {
        key: "log-settings",
        title: "ログ",
        description: "ログの表示形式をカスタマイズします。",
        inputKeyDatas: {
            log_label: {
                type: FormTypes.TEXT,
                key: "log_label",
                name: "ログラベル",
                default: "",
                description: "コンソールでのフィルター用の文字列です。"
            },
            user_name_system: {
                type: FormTypes.TEXT,
                key: "user_name_system",
                default: "システム",
                name: "システムユーザー名"
            },
            log_stamp: {
                type: FormTypes.TEXT,
                key: "log_stamp",
                default: "[スタンプ]",
                name: "スタンプログ"
            },
            log_image: {
                type: FormTypes.TEXT,
                key: "log_image",
                default: "[画像]",
                name: "画像ログ"
            },
            log_file: {
                type: FormTypes.TEXT,
                key: "log_file",
                default: "[ファイル]",
                name: "ファイルログ"
            },
            date_format: {
                type: FormTypes.TEXT,
                key: "date_format",
                name: "日付フォーマット",
                default: "yyyy/M/d(e) HH:mm:ss",
                description: "パターン文字で指定してください。 例：yyyy/M/d(e) HH:mm:ss"
            },
            custom_log_start_observe_messages: {
                type: FormTypes.TEXT,
                key: "custom_log_start_observe_messages",
                name: "カスタムログ：メッセージ監視開始文",
                default: "<time> メッセージの監視を開始します。",
                description: "&lt;time&gt;:監視開始日時"
            },
            custom_log_start_observe_talk: {
                type: FormTypes.TEXT,
                key: "custom_log_start_observe_talk",
                name: "カスタムログ：トーク監視開始文",
                default: "<time> [<talkName>]の監視を開始します。",
                description: "&lt;talkId&gt;:トークID, &lt;talkName&gt;:トーク名, &lt;time&gt;:監視開始日時"
            },
            custom_log_message_header: {
                type: FormTypes.TEXT,
                key: "custom_log_message_header",
                name: "カスタムログ：メッセージヘッダー",
                default: "<time> [<talkName>] <userName>",
                description: "&lt;talkId&gt;:トークID, &lt;talkName&gt;:トーク名, &lt;time&gt;:発言日時, &lt;userName&gt;:ユーザー名"
            }
        }
    };

    /** 設定データリスト（描画順） */
    const SETTING_DATAS = [
        USER_DIALOG_SETTING_DATA,
        INPUT_MESSAGE_SETTING_DATA,
        MULTI_VIEW_SETTING_DATA,
        WATCH_MESSAGE_SETTING_DATA,
        LOG_SETTING_DATA
    ];

    /** 機能リスト（実行順） */
    const SETTINGS_KEY_ACTIONS = {
        expand_user_icon: doExpandUserIcon,
        responsive_multi_view: doResponsiveMultiView,
        show_message_count: doShowMessageCount,
        watch_message: doWatchMessage
    };

    //設定の初期化
    initializeSettings();

    //設定画面の描画
    drawSettingView();

    //設定の取得
    const settings = getSettings();

    //各種機能の実行
    Iterator.of(SETTINGS_KEY_ACTIONS)
        .filter(key => settings[key] === true)
        .forEach((key, action) => action());

    /**
    * 設定を初期化します。
    */
    function initializeSettings(){
        const settings = getSettings();

        //未設定項目にデフォルト値を設定
        SETTING_DATAS.forEach(settingData => {
            Iterator.of(settingData.inputKeyDatas)
                .filter(key => settings[key] === undefined)
                .forEach((key, inputData) => settings[key] = inputData.default);
        });

        setSettings(settings);
    }

    /**
    * 設定画面を描画します。
    */
    function drawSettingView(){
        const settingPage = document.getElementById("environment-page");

        //水平線を描画
        const hr = createElement(ElementTypes.HR);
        settingPage.appendChild(hr);

        //説明を描画
        const description = createElementWithHTML(ElementTypes.DIV, SETTING_DESCRIPTION);
        settingPage.appendChild(description);

        //設定項目を描画
        SETTING_DATAS.forEach(settiongData => appendSettingSection(settingPage, settiongData));
    }

    /**
    * 設定画面に項目を追加します。
    * @param {HTMLElement} settingPage 設定画面
    * @param {Object} settiongData 設定データ
    */
    function appendSettingSection(settingPage, settiongData){
        //設定項目の作成
        const inputKeyDatas = settiongData.inputKeyDatas;
        const inputKeyForms = Iterator.of(inputKeyDatas).value((key, data) => createSettingInputFormElement(data)).get();
        const section = createSettingSection(settiongData, Object.values(inputKeyForms));
        settingPage.appendChild(section);

        //フォームの初期値を設定
        const settings = getSettings();
        const inputKeyInputs = Iterator.of(inputKeyForms).value(key => document.getElementById(HTML_ID_PREFIX + key)).get();
        Iterator.of(inputKeyInputs).forEach((key, input) => {
            const inputData = inputKeyDatas[key];
            switch(inputData.type){
                case FormTypes.TEXT:
                case FormTypes.TEXT_ARRAY:
                    input.value = settings[key];
                    break;
                case FormTypes.CHECKBOX:
                    input.checked = settings[key];
                    break;
            }
        });

        //値変更時に変更ボタンをクリック可能化
        const changeButton = section.querySelector('.btn');
        const message = section.querySelector('.success');
        const onChangeValue = () => {
            const inputKeyInputValues = Iterator.of(inputKeyInputs).value((key, input) => {
                const inputData = inputKeyDatas[key];
                switch(inputData.type){
                    case FormTypes.TEXT:
                    case FormTypes.TEXT_ARRAY:
                        return input.value;
                    case FormTypes.CHECKBOX:
                        return input.checked;
                }
            }).get();
            changeButton.disabled = equalsInputValueToSettings(inputKeyInputValues, settings);
            setDisplay(message, DisplayTypes.NONE);
        };
        Iterator.of(inputKeyInputs).forEach((key, input) => {
            const inputData = inputKeyDatas[key];
            switch(inputData.type){
                case FormTypes.TEXT:
                case FormTypes.TEXT_ARRAY:
                    addEventListener(input, EventTypes.INPUT, onChangeValue);
                    break;
                case FormTypes.CHECKBOX:
                    addEventListener(input, EventTypes.CLICK, onChangeValue);
                    break;
            }
        });

        //変更ボタンクリック時に設定を更新
        addEventListener(changeButton, EventTypes.CLICK, () => {
            Iterator.of(inputKeyInputs).forEach((key, input) => {
                const inputData = inputKeyDatas[key];
                switch(inputData.type){
                    case FormTypes.TEXT:
                        settings[key] = input.value;
                        break;
                    case FormTypes.TEXT_ARRAY:
                        settings[key] = stringToArray(input.value);
                        break;
                    case FormTypes.CHECKBOX:
                        settings[key] = input.checked;
                        break;
                }
            });

            setSettings(settings);
            changeButton.disabled = true;
            setDisplay(message, DisplayTypes.INLINE);
        });
    }

    /**
    * 設定画面の入力フォーム要素を作成します。
    * @param {Object} inputData インプットデータ
    * @return {HTMLElement} 入力フォーム要素
    */
    function createSettingInputFormElement(inputData){
        const inputForm = createElement(ElementTypes.DIV, {
            class: "form-group"
        });

        switch(inputData.type){
            case FormTypes.TEXT:
            case FormTypes.TEXT_ARRAY:
                const inputLabel = createElementWithHTML(ElementTypes.LABEL, inputData.name, {
                    class: "control-label"
                });
                inputForm.appendChild(inputLabel);
                const inputArea = createElement(ElementTypes.DIV, {
                    class: "controls"
                });
                const input = createElement(ElementTypes.INPUT, {
                    id: HTML_ID_PREFIX + inputData.key,
                    class: "form-control",
                    name: "status"
                });
                inputArea.appendChild(input);
                inputForm.appendChild(inputArea);
                Optional.ofAbsentable(inputData.description).ifPresent(description => {
                    const annotation = createElementWithHTML(ElementTypes.DIV, description, {
                        class: "annotation"
                    });
                    inputForm.appendChild(annotation);
                });
                break;
            case FormTypes.CHECKBOX:
                const checkboxArea = createElement(ElementTypes.DIV, {
                    class: "checkbox"
                });
                const checkboxLabel = createElement(ElementTypes.LABEL);
                const checkbox = createElement(ElementTypes.INPUT, {
                    id: HTML_ID_PREFIX + inputData.key,
                    type: "checkbox"
                });
                checkboxLabel.appendChild(checkbox);
                const labelText = document.createTextNode(inputData.name);
                checkboxLabel.appendChild(labelText);
                checkboxArea.appendChild(checkboxLabel);

                Optional.ofAbsentable(inputData.description).ifPresent(description => {
                    const annotation = createElementWithHTML(ElementTypes.DIV, description, {
                        class: "annotation"
                    });
                    checkboxArea.appendChild(annotation);
                });

                inputForm.appendChild(checkboxArea);
                break;
        }
        return inputForm;
    }

    /**
    * 設定画面の項目要素を作成します。
    * @param {Object} settingData 設定データ
    * @param {HTMLElement[]} inputForms 入力フォーム要素リスト
    * @return {HTMLElement} 項目要素
    */
    function createSettingSection(settingData, inputForms){
        const section = createElement(ElementTypes.DIV, {
            class: "c-section",
            id: HTML_ID_PREFIX + settingData.key
        });
        const header = createElementWithHTML(ElementTypes.DIV, settingData.title, {
            class: "c-section__heading"
        });
        section.appendChild(header);

        Optional.ofAbsentable(settingData.description).ifPresent(descriptionText => {
            const description = createElementWithHTML(ElementTypes.DIV, descriptionText, {
                class: "form-group"
            });
            section.appendChild(description);
        });

        inputForms.forEach(inputForm => section.appendChild(inputForm));

        const changeButtonArea = createElement(ElementTypes.DIV);
        const changeButton = createElementWithHTML(ElementTypes.BUTTON, "変更", {
            type: "button",
            class: "btn btn-primary btn-fix"
        });
        changeButton.disabled = true;
        changeButtonArea.appendChild(changeButton);
        const message = createElementWithHTML(ElementTypes.SPAN, "変更しました。", {
            class: "success"
        });
        setDisplay(message, DisplayTypes.NONE);
        changeButtonArea.appendChild(message);
        section.appendChild(changeButtonArea);

        return section;
    }

    /**
    * すべてのインプット要素の値と設定の値が等しいかどうかを判定します。
    * @param {Ocject} inputKeyInputValues
    * @param {Object} settings 設定
    * @return {Boolean} すべて等しければtrue、それ以外はfalse
    */
    function equalsInputValueToSettings(inputKeyInputValues, settings){
        return Iterator.of(inputKeyInputValues).every((key, inputValue) => {
            const settingValue = Array.isArray(settings[key]) ? arrayToString(settings[key]) : settings[key];
            return inputValue == settingValue;
        });
    }

    /**
    * ユーザーアイコンの拡大機能を実行します。
    */
    function doExpandUserIcon(){
        const CUSTOM_MODAL_Z = 9999;

        const userDialog = document.getElementById("user-dialog-basic-profile");
        const icon = userDialog.querySelector('.prof-icon-large');
        setStyle(icon, "cursor", "zoom-in");
        const image = icon.querySelector('img');

        //アイコンクリック時に拡大
        addEventListener(icon, EventTypes.CLICK, () => {
            const backgroundImage = image.style["background-image"];
            const url = backgroundImage.match(/url\("(.+)"\)/)[1];

            //モーダルで背景を暗くする
            const modal = document.querySelector('.modal-backdrop');
            const modalZ = modal.style["z-index"];
            setStyle(modal, "z-index", CUSTOM_MODAL_Z);

            //拡大画像エリアを作成
            const expandedImageArea = createElement(ElementTypes.DIV, {
                id: HTML_ID_PREFIX + "expanded-user-icon"
            },{
                "position": "fixed",
                "top": 0,
                "left": 0,
                "width": "100%",
                "height": "100%",
                "display": "flex",
                "align-items": "center",
                "justify-content": "center",
                "z-index": CUSTOM_MODAL_Z + 1,
                "cursor": "zoom-out "
            });

            //拡大画像を作成
            const expandedImage = createElement(ElementTypes.IMG, {
                src: url
            }, {
                "max-width": "100%",
                "max-height": "100%"
            });
            expandedImageArea.appendChild(expandedImage);

            //拡大画像エリアクリック時に削除
            addEventListener(expandedImageArea, EventTypes.CLICK, () => {
                document.body.removeChild(expandedImageArea);
                setStyle(modal, "z-index", modalZ);
            });
            document.body.appendChild(expandedImageArea);
        });
    }

    /**
    * マルチビューのレスポンシブ化機能を実行します。
    */
    function doResponsiveMultiView(){
        const multiPane = document.getElementById("talk-panes-multi");
        const talkPanes = multiPane.querySelectorAll('.talk-pane');
        talkPanes.forEach(talkPane => {
            const talkPaneObserver = new MutationObserver(mutations => {
                mutations.filter(mutation => mutation.attributeName == "class").forEach(mutation => {
                    const activeTalkPanes = Array.from(talkPanes).filter(talkPane => talkPane.classList.contains("has-send-form"));
                    const inactiveTalkPanes = Array.from(talkPanes).filter(talkPane => talkPane.classList.contains("no-send-form"));

                    //アクティブペインを外側から表示
                    activeTalkPanes.forEach(talkPane => {
                        setDisplay(talkPane, DisplayTypes.BLOCK);
                        const timelinebody = talkPane.querySelector('.timeline-body');
                        setDisplay(timelinebody, DisplayTypes.BLOCK);
                        const timelineHeader = talkPane.querySelector('.timeline-header');
                        const timelineFotter = talkPane.querySelector('.timeline-footer');
                        const timelineBodyHeight = talkPane.clientHeight - timelineHeader.clientHeight - timelineFotter.clientHeight;
                        setStyle(timelinebody, "height", timelineBodyHeight + "px");
                        timelinebody.scrollTop = timelinebody.scrollHeight;
                    });

                    //非アクティブペインを内側から非表示
                    inactiveTalkPanes.forEach(talkPane => {
                        const timelinebody = talkPane.querySelector('.timeline-body');
                        setDisplay(timelinebody, DisplayTypes.NONE);
                        setDisplay(talkPane, DisplayTypes.NONE);
                    });

                    //アクティブペインがない場合は空ビューを表示
                    if(activeTalkPanes.length === 0){
                        const talkPane =  talkPanes[0];
                        setDisplay(talkPane, DisplayTypes.BLOCK);
                        const emptyView = talkPane.querySelector('.empty-view-container-for-timeline');
                        emptyView.classList.remove("hide");
                        const timelineHeader = talkPane.querySelector('.timeline-header');
                        timelineHeader.style["background-color"] = "#ffffff";
                    }else{
                        const talkPane =  talkPanes[0];
                        const timelineHeader = talkPane.querySelector('.timeline-header');
                        const talkPaneColor = talkPane.querySelector('.dropdown-toggle').style["background-color"];
                        timelineHeader.style["background-color"] = talkPaneColor;
                    }
                });
            });
            //トークペイン監視開始
            observe(talkPaneObserver, talkPane, ObserveModes.ATTRIBUTES);
        });
    }

    /**
    * 入力文字数の表示機能を実行します。
    */
    function doShowMessageCount(){
        const sendForms = document.querySelectorAll('.form-send');
        sendForms.forEach(sendForm => {
            const textArea = sendForm.querySelector('.form-send-text');
            const maxLength = textArea.maxLength;

            //カウンターを作成
            const counter = createElementWithHTML(ElementTypes.LABEL, maxLength, {
                id: HTML_ID_PREFIX + "message-count"
            }, {
                "margin-right": "8px"
            });
            const sendButtonArea = sendForm.querySelector('.form-send-button-group');
            sendButtonArea.insertBefore(counter, sendButtonArea.firstChild);

            //文字入力時にカウンターの値を更新
            addEventListener(textArea, EventTypes.INPUT, () => counter.innerHTML = maxLength - textArea.value.length);
        });
    }

    /**
    * メッセージの監視機能を実行します。
    */
    function doWatchMessage(){
        const observedTalkIdList = [];
        const talkDataMap = {};

        const talks = document.getElementById("talks");
        const talksObserver = new MutationObserver(mutations => {
            //デフォルト監視対象を監視対象に追加
            if(settings.watch_default_observe_talk === true){
                //既読デフォルト監視トークIDリストの作成
                const readDefaultObserveTalkIds = settings.default_observe_talk_ids.filter(talkId => {
                    const talk = document.getElementById(talkId);
                    const badge = talk.querySelector('.corner-badge');
                    return badge === null;
                });

                //既読デフォルト監視トークを監視対象に追加
                readDefaultObserveTalkIds.filter(talkId => !existsInArray(observedTalkIdList, talkId)).forEach((talkId, index) => {
                    const talk = document.getElementById(talkId);
                    talk.click();

                    //最後の場合はトークを閉じるために2回クリック
                    const isLastTalk = index == readDefaultObserveTalkIds.length -1;
                    if(isLastTalk){
                        talk.click();
                    }
                });
            }

            //トークデータマップの更新
            mutations.forEach(mutation => {
                const nodes = mutation.addedNodes;
                nodes.forEach(node => {
                    const talk = node;
                    const talkId = talk.id;
                    const talkName = talk.querySelector('.talk-name-part').textContent;
                    const talkIsRead =  talk.querySelector('.corner-badge') === null;
                    const talkData = {
                        isRead: talkIsRead,
                        talkId: talkId,
                        talkName: talkName
                    };
                    talkDataMap[talkId] = talkData;
                });
            });
        });

        //トーク一覧監視開始
        observe(talksObserver, talks, ObserveModes.CHILD_LIST);

        const messages = document.getElementById("messages");
        const messagesObserver = new MutationObserver(mutations => {
        const observeStartDate = new Date();

            mutations.forEach(mutation => {
                const nodes = mutation.addedNodes;
                nodes.forEach(node => {
                    const talkId = node.id.replace("msgs", "talk");
                    const talkName = talkDataMap[talkId].talkName;

                    //監視トークIDリストに追加
                    observedTalkIdList.push(talkId);

                    //トークの監視
                    //メッセージが投稿されると、.real-msgs下に子ノードが追加される
                    const talk = node.querySelector('.real-msgs');
                    const talkObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                            const nodes = mutation.addedNodes;
                            Array.from(nodes).filter(node => node.className == "msg").forEach(node => {
                                const message = {
                                    talkId: talkId,
                                    talkName: talkName
                                };

                                const createdTimestamp = Number(node.getAttribute("data-created-at"));
                                const createdDate = new Date(Number(node.getAttribute("data-created-at")));
                                message.time = createdDate;

                                //過去メッセージ非表示設定時、過去メッセージであれば次へ
                                if(settings.show_past_message === false && message.time < observeStartDate){
                                    return;
        }

                                const messageArea = node.querySelector('div:first-child');
                                const userType = messageArea.className;
                                const messageBody = messageArea.querySelector('.msg-body');
                                const messageTypes = messageBody.querySelector('div').classList;
                                const messageTypeMain = messageTypes[0];

                                //ユーザー名
                                switch(userType){
            case UserTypes.SYSTEM.value:
                                        message.userName = settings.user_name_system;
                                        break;
            case UserTypes.ME.value:
                const myUserName = document.getElementById("current-username");
                                        message.userName = removeBlank(myUserName.textContent);
                                        break;
            case UserTypes.OTHERS.value:
                                        const userName = messageArea.querySelector('.username');
                                        message.userName = removeBlank(userName.textContent);
                                        break;
        }

                                //ヘッダー
                                const headerReplacers = [
                                    [/<talkId>/g, message.talkId],
                                    [/<time>/g, formatDate(message.time, settings.date_format)],
                                    [/<talkName>/g, message.talkName],
                                    [/<userName>/g, message.userName]
                                ];
                                const header = replace(settings.custom_log_message_header, headerReplacers);

                                //本文
                                if(messageTypes.length == 1){
                                    switch(messageTypeMain){
                                        case MessageTypes.TEXT.value:
                                        case MessageTypes.STAMP_AND_TEXT.value:
                                            //本文テキストのみを取得するためにコピーしたノードからメッセージメニューを削除
                                            const messageText = deepCloneNode(messageBody.querySelector('.msg-text'));
        const messageMenu = messageText.querySelector('.msg-menu-container');
                                            if(messageMenu !== null){
                                                messageText.removeChild(messageMenu);
    }

                                            message.body = messageText.textContent;
                                            break;
                                        case MessageTypes.STAMP.value:
                                            message.body = settings.log_stamp;
                                            break;
    }
                                }else{
                                    const messageTypeSub = messageTypes[1];
                                    switch(messageTypeSub){
                                        case MessageTypes.FILE.value:
                                            const fileIsImage = messageBody.querySelector('.msg-thumb').classList.contains(MessageTypes.IMAGE.value);
                                            const prefix = fileIsImage ? settings.log_image : settings.log_file;
                                            const thumbnailText = messageBody.querySelector('.msg-thumbs-text');
                                            const text = thumbnailText !== null ? thumbnailText.textContent : "";
                                            message.body = prefix + text;
                                            break;
    }
    }

                                //スタンプ
                                switch(messageTypeMain){
                                    case MessageTypes.STAMP.value:
                                    case MessageTypes.STAMP_AND_TEXT.value:
                                        message.stamp = messageBody.querySelector('img');
                                        break;
    }

                                //メッセージをコンソールに出力
                                console.group(header);
                                if(message.stamp !== undefined){
                                    console.log(settings.log_label, message.body, message.stamp);
                                }else{
                                    console.log(settings.log_label, message.body);
        }
                                console.groupEnd();
                            });
                        });
                    });

                    //メッセージ監視開始
                    const talkReplacers = [
                        [/<talkId>/g, talkId],
                        [/<time>/g, formatDate(observeStartDate, settings.date_format)],
                        [/<talkName>/g, talkName]
                    ];
                    console.info(settings.log_label, replace(settings.custom_log_start_observe_talk, talkReplacers));
                    observe(talkObserver, talk, ObserveModes.CHILD_LIST);
                });
            });
        });

        //メッセージエリア監視開始
        const observeStartDate = new Date();
        const messagseReplacers = [
            [/<time>/g, formatDate(observeStartDate, settings.date_format)]
        ];
        console.info(settings.log_label, replace(settings.custom_log_start_observe_messages, messagseReplacers));
        observe(messagesObserver, messages, ObserveModes.CHILD_LIST);
    }

    /**
    * オブジェクトを深く凍結します。
    * @param {Object} object オブジェクト
    */
    function deepFreeze(object){
        Object.freeze(object);
        Iterator.of(object).forEach((key, value) => {
            if(!object.hasOwnProperty(key) || typeof value != "object" || Object.isFrozen(value)){
                return;
            }
            deepFreeze(value);
        });
    }

    /**
    * 文字列から空白文字を取り除きます。
    * @param {String} source 文字列
    * @return {String} 空白文字を取り除いた文字列
    */
    function removeBlank(source) {
        return source.replace(/[\s　]/g, "");
    }

    /**
    * 文字列を複数の条件で置換します。
    * @param {String} source 文字列
    * @param {Object[][]} replacers 置換用オブジェクト
    * @return {String} 置換した文字列
    */
    function replace(source, replacers) {
        let replaced = source;
        replacers.forEach(replacer => replaced = replaced.replace(replacer[0], replacer[1]));
        return replaced;
    }

    /**
    * Dateオブジェクトを指定したパターンでフォーマットします。
    * cf. https://docs.oracle.com/javase/jp/8/docs/api/java/time/format/DateTimeFormatter.html#patterns
    * @param {Date} date Dateオブジェクト
    * @param {String} pattern パターン
    * @return {String} フォーマットした文字列
    */
    function formatDate(date, pattern){
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const dayOfMonth = date.getDate();
        const dayOfWeek = date.getDay();
        const dayTexts = ["日", "月", "火", "水", "木", "金", "土"];
        const dayOfWeekText = dayTexts[dayOfWeek];
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        return replace(pattern, [
            [/yyyy/g, year],
            [/yy/g, year % 100],
            [/MM/g, zeroPadding(month, 2)],
            [/M/g, month],
            [/dd/g, zeroPadding(dayOfMonth, 2)],
            [/d/g, dayOfMonth],
            [/e/g, dayOfWeekText],
            [/HH/g, zeroPadding(hours, 2)],
            [/H/g, hours],
            [/mm/g, zeroPadding(minutes, 2)],
            [/m/g, minutes],
            [/ss/g, zeroPadding(seconds, 2)],
            [/s/g, seconds]
        ]);
    }

    /**
    * 数値を指定した桁数になるようにゼロ埋めします。
    * @param {Number} num 数値
    * @param {Number} digits 桁数
    * @return {String} ゼロ埋めした文字列
    */
    function zeroPadding(num, digits){
        const source = String(num);
        let zeros = "";
        for(let i = 0; i < digits - source.length; i++){
            zeros += "0";
        }
        return zeros + source;
    }

    /**
    * 配列をカンマ区切りの文字列に変換します。
    * 配列が空の場合は空文字を返します。
    * @param {String[]} array
    * @return {String} カンマ区切りの文字列
    */
    function arrayToString(array){
        return array.join(",");
    }

    /**
    * カンマ区切りの文字列を配列に変換します。
    * 空文字の場合は空の配列を返します。
    * @param {String} string カンマ区切りの文字列
    * @return {String[]} 配列
    */
    function stringToArray(string){
        return string !== "" ? string.split(",") : [];
    }

    /**
    * 配列内に値が存在するかどうかを判定します。
    * @param {Object[]} array 配列
    * @param {Object} value 値
    * @return {Boolean} 配列内に値が存在すればtrue、しなければfalse
    */
    function existsInArray(array, value){
        return array.indexOf(value) >= 0;
    }

    /**
     * ノードの変更を監視します。
     * @param {MutationObserver} observer オブザーバー
     * @param {Node} target 監視対象ノード
     * @param {ObserveMode} mode 監視モード
     * @throws {Error} エラー
     */
    function observe(observer, target, mode){
        if(!(mode instanceof ObserveMode)){
            throw new Error("mode is not instance of ObserveMode");
        }
        observer.observe(target, mode.value);
    }

    /**
    * ノードの深い複製を返します。
    * @param {Node} node ノード
    * @return {Node} ノードの深い複製
    */
    function deepCloneNode(node){
        return node.cloneNode(true);
    }

    /**
    * 内部テキストを持ったHTML要素を作成します。属性やスタイルがあれば設定します。
    * @param {ElementType} type 要素種別
    * @param {Object} [attributes] 属性
    * @param {Object} [styles] スタイル
    * @param {String} text テキスト
    * @return {HTMLElement} HTML要素
    */
    function createElementWithText(type, text, attributes, styles){
        const element = createElement(type, attributes, styles);
        element.textContent = text;
        return element;
    }

    /**
    * 内部HTMLを持ったHTML要素を作成します。属性やスタイルがあれば設定します。
    * @param {ElementType} type 要素種別
    * @param {Object} [attributes] 属性
    * @param {Object} [styles] スタイル
    * @param {String} html HTML
    * @return {HTMLElement} HTML要素
    */
    function createElementWithHTML(type, html, attributes, styles){
        const element = createElement(type, attributes, styles);
        element.innerHTML = html;
        return element;
    }

    /**
    * HTML要素を作成します。属性やスタイルがあれば設定します。
    * @param {ElementType} type 要素種別
    * @param {Object} [attributes] 属性
    * @param {Object} [styles] スタイル
    * @return {HTMLElement} HTML要素
    * @throws {Error} typeの型がElementTypeではない場合
    */
    function createElement(type, attributes, styles){
        if(!(type instanceof ElementType)){
            throw new Error("type is not instance of ElementType");
        }
        const element = document.createElement(type.value);
        Optional.ofAbsentable(attributes).ifPresent(attributes => setAttributes(element, attributes));
        Optional.ofAbsentable(styles).ifPresent(styles => setStyles(element, styles));
        return element;
    }

    /**
    * HTML要素に属性を設定します。
    * @param {HTMLElement} element HTML要素
    * @param {Object} attributes 属性
    */
    function setAttributes(element, attributes){
        Iterator.of(attributes).forEach((name, value) => setAttribute(element, name, value));
    }

    /**
    * HTML要素に属性を設定します。
    * @param {HTMLElement} element HTML要素
    * @param {String} name 属性名
    * @param {String} value 値
    */
    function setAttribute(element, name, value){
        element.setAttribute(name, value);
    }

    /**
    * HTML要素にディスプレイ属性を設定します。
    * @param {HTMLElement} element HTML要素
    * @param {DisplayType} type ディスプレイ種別
    * @throws {Error} typeの型がDisplayTypeではない場合
    */
    function setDisplay(element, type){
        if(!(type instanceof DisplayType)){
            throw new Error("type is not instance of DisplayType");
        }
        setStyle(element, "display", type.value);
    }

    /**
    * HTML要素にスタイルを設定します。
    * @param {HTMLElement} element HTML要素
    * @param {Object} styles スタイル
    */
    function setStyles(element, styles){
        Iterator.of(styles).forEach((name, value) => setStyle(element, name, value));
    }

    /**
    * HTML要素にスタイルを設定します。
    * @param {HTMLElement} element HTML要素
    * @param {String} name プロパティ名
    * @param {String} value 値
    */
    function setStyle(element, name, value){
        element.style[name] = value;
    }

    /**
    * HTML要素にイベントリスナーを追加します。
    * @param {HTMLElement} element HTML要素
    * @param {EventType} type イベント種別
    * @param {Function} listener イベントリスナー
    * @throws {Error} typeの型がEventTypeではない場合
    */
    function addEventListener(element, type, listener){
        if(!(type instanceof EventType)){
            throw new Error("type is not instance of EventType");
        }
        element.addEventListener(type.value, listener, false);
    }

    /**
    * ローカルストレージからJSON形式の設定を取得します。
    * ローカルストレージ上に値が存在しない場合、空のオブジェクトを返します。
    * @return {Object} 設定
    */
    function getSettings(){
        const settings = localStorage[LOCAL_STORAGE_SETTINGS_KEY];
        return settings !== undefined ? JSON.parse(settings) : {};
    }

    /**
    * ローカルストレージにJSON形式で設定をセットします。
    * @param {Object} settings 設定
    */
    function setSettings(settings){
        localStorage[LOCAL_STORAGE_SETTINGS_KEY] = JSON.stringify(settings);
    }
})();