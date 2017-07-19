// ==UserScript==
// @name         direct helper
// @namespace    http://munieru.hatenablog.com/
// @version      1.0
// @description  directに便利な機能を追加します。
// @author       Munieru
// @match       https://www.direct4b.com/home*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /** 属性 */
    const Attribute = {
        CLASS: "class",
        ID: "id",
        NAME: "name",
        TYPE: "type"
    };

    /** ディスプレイ */
    const Display = {
        BLOCK: "block",
        INLINE: "inline",
        NONE: "none"
    };

    /** 要素 */
    const Element = {
        BUTTON: "button",
        DIV: "div",
        HR: "hr",
        INPUT: "input",
        LABEL: "label",
        SPAN: "span"
    };

    /** イベント */
    const Event = {
        CLICK: "click",
        INPUT: "input"
    };

    /** フォーム */
    const Form = {
        CHECKBOX: "checkbox",
        TEXT: "text",
        TEXT_ARRAY: "text_array"
    };

    /** ユーザー種別 */
    const UserType = {
        ME: "my-msg",
        OTHERS: "your-msg",
        SYSTEM: "system-msg"
    };

    /** メッセージ種別 */
    const MessageType = {
        FILE: "msg-text-contained-thumb",
        IMAGE: "thumb-cover",
        STAMP: "stamp",
        STAMP_AND_TEXT: "stamp-with-text",
        TEXT: "msg-text"
    };

    /** id属性接頭辞 */
    const HTML_ID_PREFIX = "direct_helper-";

    /** 子ノード変更監視用オプション */
    const OBSERVE_CHILD_LIST = {childList: true};

    /** ローカルストレージ設定キー */
    const LOCAL_STORAGE_SETTINGS_KEY = "direct_helper_settings";
    /** 設定デフォルト値 */
    const SETTINGS_DEFAULT_VALUES = {
        custom_log_message_header:  "<time> [<talkName>] <userName>",
        custom_log_start_observe_messages: "<time> メッセージの監視を開始します。",
        custom_log_start_observe_talk: "<time> [<talkName>]の監視を開始します。",
        date_format: "yyyy/M/d(e) HH:mm:ss",
        default_observe_talk_ids: [
            "talk-_97330855_1031798784",
            "talk-_102213111_1073741824",
            "talk-_118248815_880803840",
            "talk-_119288644_-901775360",
            "talk-_144680843_-33554432"
        ],
        log_file: "[ファイル]",
        log_image: "[画像]",
        log_label: "direct helper",
        log_stamp: "[スタンプ]",
        show_past_message: false,
        user_name_system: "システム",
        watch_default_observe_talk: true,
        watch_message: true,
    };

    /** メッセージ監視設定項目データ */
    const SETTING_SECTION_WATCH_MESSAGE_DATA = {
        key: "message-watching-settings",
        title: "メッセージ監視",
        description: "メッセージを監視してコンソールに出力します。",
        inputKeyDatas: {
            watch_message: {
                type: Form.CHECKBOX,
                key: "watch_message",
                name: "メッセージの監視",
                description: "メッセージを監視してコンソールに出力します。"
            },
            show_past_message: {
                type: Form.CHECKBOX,
                key: "show_past_message",
                name: "過去メッセージの表示",
                description: "監視開始以前のメッセージを表示します。"
            },
            watch_default_observe_talk: {
                type: Form.CHECKBOX,
                key: "watch_default_observe_talk",
                name: "デフォルト監視対象の監視",
                description: "デフォルト監視トークIDで指定したトークが未読であれば、自動で監視します。"
            },
            default_observe_talk_ids: {
                type: Form.TEXT_ARRAY,
                key: "default_observe_talk_ids",
                name: "デフォルト監視トークID",
                description: 'HTMLのid属性のうち、"talk-_"で始まるものを半角カンマ区切りで入力してください。'
            }
        }
    };

    /** ログ設定項目データ */
    const SETTING_SECTION_LOG_DATA = {
        key: "log-settings",
        title: "ログ",
        description: "ログの表示形式をカスタマイズします。",
        inputKeyDatas: {
            log_label: {
                type: Form.TEXT,
                key: "log_label",
                name: "ログラベル",
                description: "コンソールでのフィルター用の文字列です。"
            },
            user_name_system: {
                type: Form.TEXT,
                key: "user_name_system",
                name: "システムユーザー名"
            },
            log_stamp: {
                type: Form.TEXT,
                key: "log_stamp",
                name: "スタンプログ"
            },
            log_image: {
                type: Form.TEXT,
                key: "log_image",
                name: "画像ログ"
            },
            log_file: {
                type: Form.TEXT,
                key: "log_file",
                name: "ファイルログ"
            },
            date_format: {
                type: Form.TEXT,
                key: "date_format",
                name: "日付フォーマット",
                description: "パターン文字で指定してください。 例：yyyy/M/d(e) HH:mm:ss"
            },
            custom_log_start_observe_messages: {
                type: Form.TEXT,
                key: "custom_log_start_observe_messages",
                name: "カスタムログ：メッセージ監視開始文",
                description: "&lt;time&gt;:監視開始日時"
            },
            custom_log_start_observe_talk: {
                type: Form.TEXT,
                key: "custom_log_start_observe_talk",
                name: "カスタムログ：トーク監視開始文",
                description: "&lt;talkId&gt;:トークID, &lt;talkName&gt;:トーク名, &lt;time&gt;:監視開始日時"
            },
            custom_log_message_header: {
                type: Form.TEXT,
                key: "custom_log_message_header",
                name: "カスタムログ：メッセージヘッダー",
                description: "&lt;talkId&gt;:トークID, &lt;talkName&gt;:トーク名, &lt;time&gt;:発言日時, &lt;userName&gt;:ユーザー名"
            }
        }
    };

    /** 設定項目データリスト */
    const SETTING_SECTION_DATAS = [
        SETTING_SECTION_WATCH_MESSAGE_DATA,
        SETTING_SECTION_LOG_DATA
    ];

    /** 設定画面説明 */
    const SETTING_DESCRIPTION = "以下はdirect helperの設定です。設定変更後はページをリロードしてください。";

    //設定の初期化
    initializeSettings();

    //設定の取得
    const settings = getSettings();

    //設定画面の描画
    drawSettingView();

    //メッセージの監視
    if(settings.watch_message === true){
        observeMessages();
    }

    /**
    * 設定を初期化します。
    */
    function initializeSettings(){
        const settings = getSettings();

        //未設定項目にデフォルト値を設定
        for(const key in SETTINGS_DEFAULT_VALUES) {
            if(settings[key] === undefined){
                settings[key] = SETTINGS_DEFAULT_VALUES[key];
            }
        }

        setSettings(settings);
    }

    /**
    * 設定画面を描画します。
    */
    function drawSettingView(){
        const settingPage = document.getElementById("environment-page");

        //水平線
        const hr = createElement(Element.HR);
        settingPage.appendChild(hr);

        //説明
        const description = createElement(Element.DIV, SETTING_DESCRIPTION);
        settingPage.appendChild(description);

        //設定項目
        SETTING_SECTION_DATAS.forEach(settingSectionData => {
            drawSettingSection(settingPage, settingSectionData);
        });
    }

    /**
    * 設定画面に設定項目を描画します。
    * @param {Element} settingPage 設定画面
    * @param {Object} settingSectionData 設定項目データ
    */
    function drawSettingSection(settingPage, settingSectionData){
        const inputKeyDatas = settingSectionData.inputKeyDatas;
        const settings = getSettings();

        //インプットフォーム要素の作成
        const inputKeyForms = convertObjectValue(inputKeyDatas, (inputKey, inputData) => createSettingInputFormElement(inputData));
        const inputForms = Object.values(inputKeyForms);
        const section = createSettingSection(settingSectionData, inputForms);
        settingPage.appendChild(section);

        //フォームの初期値にローカルストレージの値を設定
        const inputKeyInputs = convertObjectValue(inputKeyForms, (inputKey, inputForm) => {
            const input = inputForm.querySelector('#' + HTML_ID_PREFIX + inputKey);
            const inputData = inputKeyDatas[inputKey];
            switch(inputData.type){
                case Form.TEXT:
                case Form.TEXT_ARRAY:
                    input.value = settings[inputKey];
                    break;
                case Form.CHECKBOX:
                    input.checked = settings[inputKey];
                    break;
            }
            return input;
        });

        //値が変更されたらボタンをクリック可能化
        const button = section.querySelector('.btn');
        const message = section.querySelector('.success');
        const onChangeValue = () => {
            button.disabled = equalsAllInputValueToSettings(inputKeyDatas, inputKeyInputs, settings);
            setDisplay(message, Display.NONE);
        };
        for(const key in inputKeyInputs){
            const input = inputKeyInputs[key];
            const inputData = inputKeyDatas[key];
            switch(inputData.type){
                case Form.TEXT:
                case Form.TEXT_ARRAY:
                    addEventListener(input, Event.INPUT, onChangeValue);
                    break;
                case Form.CHECKBOX:
                    addEventListener(input, Event.CLICK, onChangeValue);
                    break;
            }
        }

        //ボタンがクリックされたらローカルストレージの値を更新
        const onClickButton = () => {
            for(const key in inputKeyInputs){
                const input = inputKeyInputs[key];
                const inputData = inputKeyDatas[key];
                switch(inputData.type){
                    case Form.TEXT:
                        settings[key] = input.value;
                        break;
                    case Form.TEXT_ARRAY:
                        settings[key] = stringToArray(input.value);
                        break;
                    case Form.CHECKBOX:
                        settings[key] = input.checked;
                        break;
                }
            }

            setSettings(settings);
            button.disabled = true;
            setDisplay(message, Display.INLINE);
        };
        addEventListener(button, Event.CLICK, onClickButton);
    }

    /**
    * 設定画面のインプットフォーム要素を作成します。
    * @param {Object] inputData インプットデータ
    * @return {Element} インプットフォーム要素
    */
    function createSettingInputFormElement(inputData){
        const form = createElement(Element.DIV);
        form.setAttribute(Attribute.CLASS, "form-group");
        const label = createElement(Element.LABEL);

        switch(inputData.type){
            case Form.TEXT:
            case Form.TEXT_ARRAY:
                label.setAttribute(Attribute.CLASS, "control-label");
                label.innerText = inputData.name;

                const input = createElement(Element.INPUT);
                input.setAttribute(Attribute.ID, HTML_ID_PREFIX + inputData.key);
                input.setAttribute(Attribute.CLASS, "form-control");
                input.setAttribute(Attribute.NAME, "status");

                const inputArea = createElement(Element.DIV);
                inputArea.setAttribute(Attribute.CLASS, "controls");
                inputArea.appendChild(input);

                form.appendChild(label);
                form.appendChild(inputArea);

                if(inputData.description !== undefined){
                    const annotation = createElement(Element.DIV, inputData.description);
                    annotation.setAttribute(Attribute.CLASS, "annotation");
                    form.appendChild(annotation);
                }
                break;
            case Form.CHECKBOX:
                const checkbox = createElement(Element.INPUT);
                checkbox.setAttribute(Attribute.ID, HTML_ID_PREFIX + inputData.key);
                checkbox.setAttribute(Attribute.TYPE, "checkbox");

                const labelText = document.createTextNode(inputData.name);
                label.appendChild(checkbox);
                label.appendChild(labelText);

                const checkboxArea = createElement(Element.DIV);
                checkboxArea.setAttribute(Attribute.CLASS, "checkbox");
                checkboxArea.appendChild(label);

                if(inputData.description !== undefined){
                    const annotation = createElement(Element.DIV, inputData.description);
                    annotation.setAttribute(Attribute.CLASS, "annotation");
                    checkboxArea.appendChild(annotation);
                }

                form.appendChild(checkboxArea);
                break;
        }
        return form;
    }

    /**
    * 設定画面の項目要素を作成します。
    * @param {Object} settingSectionData 設定項目データ
    * @param {Object} inputKeyForms
    * @return {Element} 項目要素
    */
    function createSettingSection(settingSectionData, inputKeyForms){
        const header = createElement(Element.DIV, settingSectionData.title);
        header.setAttribute(Attribute.CLASS, "c-section__heading");

        let description;
        if(settingSectionData.description !== undefined){
            description = createElement(Element.DIV, settingSectionData.description);
            description.setAttribute(Attribute.CLASS, "form-group");
        }

        const button = createElement(Element.BUTTON, "変更");
        button.setAttribute(Attribute.TYPE, "button");
        button.setAttribute(Attribute.CLASS, "btn btn-primary btn-fix");
        button.disabled = true;

        const message = createElement(Element.SPAN, "変更しました。");
        message.setAttribute(Attribute.CLASS, "success");
        setDisplay(message, Display.NONE);

        const buttonArea = createElement(Element.DIV);
        buttonArea.appendChild(button);
        buttonArea.appendChild(message);

        const section = createElement(Element.DIV);
        section.setAttribute(Attribute.CLASS, "c-section");
        section.setAttribute(Attribute.ID, HTML_ID_PREFIX + settingSectionData.key);
        section.appendChild(header);

        if(description !== undefined){
            section.appendChild(description);
        }

        Object.values(inputKeyForms).forEach(inputForm => {
            section.appendChild(inputForm);
        });
        section.appendChild(buttonArea);

        return section;
    }

    /**
    * すべてのインプット要素の値と設定の値が等しいかを判定します。
    * @param {Ocject} inputKeyDatas
    * @param {Ocject} inputKeyInputs
    * @param {Object} settings 設定
    * @return {Boolean} すべて等しければtrue、それ以外はfalse
    */
    function equalsAllInputValueToSettings(inputKeyDatas, inputKeyInputs, settings){
        for(const key in inputKeyInputs){
            const input = inputKeyInputs[key];
            const inputData = inputKeyDatas[key];
            switch(inputData.type){
                case Form.TEXT:
                    if(input.value != settings[key]) return false;
                    break;
                case Form.TEXT_ARRAY:
                    if(!equalsArrayToString(settings[key], input.value)) return false;
                    break;
                case Form.CHECKBOX:
                    if(input.checked != settings[key]) return false;
                    break;
            }
        }
        return true;
    }

    /**
    * メッセージを監視します。
    */
    function observeMessages(){
        const observedTalkIdList = [];
        const talkDataMap = {};

        //トーク一覧の監視
        //トーク一覧にトークが追加されると、#talks下に子ノードが追加される
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
                const length = readDefaultObserveTalkIds.length;
                for(let i = 0; i < length; i++) {
                    const talkId = readDefaultObserveTalkIds[i];
                    const talk = document.getElementById(talkId);
                    const talkIsObserved = existsInArray(observedTalkIdList, talkId);

                    if(!talkIsObserved){
                        talk.click();

                        //最後の場合はトークを閉じるために2回クリック
                        const isLastTalk = i == length -1;
                        if(isLastTalk){
                            talk.click();
                        }
                    }
                }
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
        talksObserver.observe(talks, OBSERVE_CHILD_LIST);

        //メッセージエリアの監視
        //トークが開かれると、#messages下に子ノードが追加される
        const messages = document.getElementById("messages");
        const messagesObserver = new MutationObserver(mutations => {
            const ovserveStartDate = new Date();

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
                            nodes.forEach(node => {
                                //メッセージではなければ次のノードへ
                                if(node.className != "msg"){
                                    return;
                                }

                                const message = {
                                    talkId: talkId,
                                    talkName: talkName
                                };

                                const createdTimestamp = Number(node.getAttribute("data-created-at"));
                                const createdDate = new Date(Number(node.getAttribute("data-created-at")));
                                message.time = createdDate;

                                //過去メッセージ非表示設定時、過去メッセージであれば次のノードへ
                                if(settings.show_past_message === false && message.time < ovserveStartDate){
                                    return;
                                }

                                const messageArea = node.querySelector('div:first-child');
                                const userType = messageArea.className;
                                const messageBody = messageArea.querySelector('.msg-body');
                                const messageTypes = messageBody.querySelector('div').classList;
                                const messageTypeMain = messageTypes[0];

                                //ユーザー名
                                switch(userType){
                                    case UserType.SYSTEM:
                                        message.userName = settings.user_name_system;
                                        break;
                                    case UserType.ME:
                                        const myUserName = document.getElementById("current-username");
                                        message.userName = removeBlank(myUserName.textContent);
                                        break;
                                    case UserType.OTHERS:
                                        const userName = messageArea.querySelector('.username');
                                        message.userName = removeBlank(userName.textContent);
                                        break;
                                    default:
                                        message.userName = "";
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
                                        case MessageType.TEXT:
                                        case MessageType.STAMP_AND_TEXT:
                                            //本文テキストのみを取得するためにコピーしたノードからメッセージメニューを削除
                                            const messageText = deepCloneNode(messageBody.querySelector('.msg-text'));
                                            const messageMenu = messageText.querySelector('.msg-menu-container');
                                            if(messageMenu !== null){
                                                messageText.removeChild(messageMenu);
                                            }

                                            message.body = messageText.textContent;
                                            break;
                                        case MessageType.STAMP:
                                            message.body = settings.log_stamp;
                                            break;
                                        default:
                                            message.body = "";
                                    }
                                }else{
                                    const messageTypeSub = messageTypes[1];
                                    switch(messageTypeSub){
                                        case MessageType.FILE:
                                            const fileIsImage = messageBody.querySelector('.msg-thumb').classList.contains(MessageType.IMAGE);
                                            const prefix = fileIsImage ? settings.log_image : settings.log_file;
                                            const thumbnailText = messageBody.querySelector('.msg-thumbs-text');
                                            const text = thumbnailText !== null ? thumbnailText.textContent : "";
                                            message.body = prefix + text;
                                            break;
                                        default:
                                            message.body = "";
                                    }
                                }

                                //スタンプ
                                switch(messageTypeMain){
                                    case MessageType.STAMP:
                                    case MessageType.STAMP_AND_TEXT:
                                        message.stamp = messageBody.querySelector('img');
                                        break;
                                    default:
                                        message.stamp = "";
                                }

                                //メッセージをコンソールに出力
                                console.group(header);
                                console.log(settings.log_label, message.body, message.stamp);
                                console.groupEnd();
                            });
                        });
                    });

                    //メッセージ監視開始
                    const talkReplacers = [
                        [/<talkId>/g, talkId],
                        [/<time>/g, formatDate(ovserveStartDate, settings.date_format)],
                        [/<talkName>/g, talkName]
                    ];
                    console.info(settings.log_label, replace(settings.custom_log_start_observe_talk, talkReplacers));
                    talkObserver.observe(talk, OBSERVE_CHILD_LIST);
                });
            });
        });

        //メッセージエリア監視開始
        const observeStartDate = new Date();
        const messagseReplacers = [
            [/<time>/g, formatDate(observeStartDate, settings.date_format)]
        ];
        console.info(settings.log_label, replace(settings.custom_log_start_observe_messages, messagseReplacers));
        messagesObserver.observe(messages, OBSERVE_CHILD_LIST);
    }

    /**
    * オブジェクトの値を変換して新しいオブジェクトを作成します。
    * @param {Object} object オブジェクト
    * @param {Function} converter 変換関数：(key, value) => newValue
    * @return {Object} 変換したオブジェクト
    */
    function convertObjectValue(object, converter){
        const converted = {};
        for(const key in object){
            const value = object[key];
            converted[key] = converter(key, value);
        }
        return converted;
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
        for(const replacer of replacers) {
            replaced = replaced.replace(replacer[0], replacer[1]);
        }
        return replaced;
    }

    /**
    * Dateオブジェクトを指定したパターンでフォーマットします。
    * cf. https://docs.oracle.com/javase/jp/8/docs/api/java/time/format/DateTimeFormatter.html#patterns
    * @param {Date} date Dateオブジェクト
    * @param {String] pattern パターン
    * @return {String} フォーマットした文字列
    */
    function formatDate(date, pattern){
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const dayOfMonth = date.getDate();
        const day = date.getDay();
        const dayTexts = ["日", "月", "火", "水", "木", "金", "土"];
        const dayText = dayTexts[day];
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const replacers = [
            [/yyyy/g, year],
            [/yy/g, year % 100],
            [/MM/g, zeroPadding(month, 2)],
            [/M/g, month],
            [/dd/g, zeroPadding(dayOfMonth, 2)],
            [/d/g, dayOfMonth],
            [/e/g, dayText],
            [/HH/g, zeroPadding(hours, 2)],
            [/H/g, hours],
            [/mm/g, zeroPadding(minutes, 2)],
            [/m/g, minutes],
            [/ss/g, zeroPadding(seconds, 2)],
            [/s/g, seconds]
        ];
        return replace(pattern, replacers);
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
    * 文字列が空の場合は空の配列を返します。
    * @param {String} string カンマ区切りの文字列
    * @return {String[]} 配列
    */
    function stringToArray(string){
        return string !== "" ? string.split(",") : [];
    }

    /**
    * 配列とカンマ区切りの文字列が等しいかどうかを判定します。
    * @param {String[]} array 配列
    * @param {String} string カンマ区切りの文字列
    * @return {Boolean} 配列とカンマ区切りの文字列が等しければtrue、等しくなければfalse
    */
    function equalsArrayToString(array, string){
        return arrayToString(array) == string;
    }

    /**
    * 配列内に要素が存在するかどうかを判定します。
    * @param {Object[]} array 配列
    * @param {Object} element 要素
    * @return {Boolean} 配列内に要素が存在すればtrue、しなければfalse
    */
    function existsInArray(array, element){
        return array.indexOf(element) >= 0;
    }

    /**
    * 要素を作成します。内部HTMLがあれば設定します。
    * @param {String} element 要素名
    * @param {String} [innerHTML] 内部HTML
    * @return {Element} 要素
    */
    function createElement(element, innerHTML){
        const div = document.createElement(element);
        if(innerHTML !== undefined){
            div.innerHTML = innerHTML;
        }
        return div;
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
    * 要素のディスプレイ属性を設定します。
    * @param {Element} element 要素
    * @param {String} display ディスプレイ属性
    */
    function setDisplay(element, display){
        element.style.display = display;
    }

    /**
    * 要素にイベントを追加します。
    * @param {Element} element 要素
    * @param {String} event イベント
    * @paran {Function} listener イベント発生時実行関数
    */
    function addEventListener(element, event, listener){
        element.addEventListener(event, listener, false);
    }

    /**
    * ローカルストレージから設定を取得します。
    * ローカルストレージ上に値が存在しない場合、空のオブジェクトを返します。
    * @return {Object} 設定
    */
    function getSettings(){
        const settings = localStorage[LOCAL_STORAGE_SETTINGS_KEY];
        return settings !== undefined ? JSON.parse(settings) : {};
    }

    /**
    * ローカルストレージに設定をセットします。
    * @param {Object} settings 設定
    */
    function setSettings(settings){
        localStorage[LOCAL_STORAGE_SETTINGS_KEY] = JSON.stringify(settings);
    }
})();