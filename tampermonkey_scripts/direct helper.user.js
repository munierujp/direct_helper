// ==UserScript==
// @name         direct helper
// @namespace    https://github.com/munierujp/direct_helper
// @version      1.1
// @description  directに便利な機能を追加します。
// @author       Munieru
// @match       https://*.direct4b.com/home*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /** value保持クラス */
    class HasValue{
        constructor(value){
            this.value = value;
        }
    }

    /** 属性種別クラス */
    class AttributeType extends HasValue{}
    /** 属性種別 */
    const AttributeTypes = {
        CLASS: new AttributeType("class"),
        ID: new AttributeType("id"),
        NAME: new AttributeType("name"),
        TYPE: new AttributeType("type")
    };

    /** ディスプレイ種別クラス */
    class DisplayType extends HasValue{}
    /** ディスプレイ種別 */
    const DisplayTypes = {
        BLOCK: new DisplayType("block"),
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
        AttributeTypes,
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

    /** 設定デフォルト値 */
    const SETTINGS_DEFAULT_VALUES = {
        custom_log_message_header:  "<time> [<talkName>] <userName>",
        custom_log_start_observe_messages: "<time> メッセージの監視を開始します。",
        custom_log_start_observe_talk: "<time> [<talkName>]の監視を開始します。",
        date_format: "yyyy/M/d(e) HH:mm:ss",
        default_observe_talk_ids: [],
        log_file: "[ファイル]",
        log_image: "[画像]",
        log_label: "",
        log_stamp: "[スタンプ]",
        responsive_multi_view: true,
        show_past_message: false,
        user_name_system: "システム",
        watch_default_observe_talk: true,
        watch_message: true,
    };

    /** 設定画面説明 */
    const SETTING_DESCRIPTION = "以下はdirect helperの設定です。設定変更後はページをリロードしてください。";

    /** マルチビュー設定項目データ */
    const SETTING_SECTION_MULTI_VIEW = {
        key: "multi-view-settings",
        title: "マルチビュー",
        description: "マルチビューの動作を変更します。",
        inputKeyDatas: {
            responsive_multi_view: {
                type: FormTypes.CHECKBOX,
                key: "responsive_multi_view",
                name: "マルチビューのレスポンシブ化",
                description: "選択状態に応じてマルチビューのカラム数を動的に変更します。"
            }
        }
    };

    /** メッセージ監視設定項目データ */
    const SETTING_SECTION_WATCH_MESSAGE_DATA = {
        key: "message-watching-settings",
        title: "メッセージ監視",
        description: "メッセージを監視してコンソールに出力します。",
        inputKeyDatas: {
            watch_message: {
                type: FormTypes.CHECKBOX,
                key: "watch_message",
                name: "メッセージの監視",
                description: "メッセージを監視してコンソールに出力します。"
            },
            show_past_message: {
                type: FormTypes.CHECKBOX,
                key: "show_past_message",
                name: "過去メッセージの表示",
                description: "監視開始以前のメッセージを表示します。"
            },
            watch_default_observe_talk: {
                type: FormTypes.CHECKBOX,
                key: "watch_default_observe_talk",
                name: "デフォルト監視対象の自動監視",
                description: "デフォルト監視トークIDで指定したトークが未読であれば、自動で監視します。"
            },
            default_observe_talk_ids: {
                type: FormTypes.TEXT_ARRAY,
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
                type: FormTypes.TEXT,
                key: "log_label",
                name: "ログラベル",
                description: "コンソールでのフィルター用の文字列です。"
            },
            user_name_system: {
                type: FormTypes.TEXT,
                key: "user_name_system",
                name: "システムユーザー名"
            },
            log_stamp: {
                type: FormTypes.TEXT,
                key: "log_stamp",
                name: "スタンプログ"
            },
            log_image: {
                type: FormTypes.TEXT,
                key: "log_image",
                name: "画像ログ"
            },
            log_file: {
                type: FormTypes.TEXT,
                key: "log_file",
                name: "ファイルログ"
            },
            date_format: {
                type: FormTypes.TEXT,
                key: "date_format",
                name: "日付フォーマット",
                description: "パターン文字で指定してください。 例：yyyy/M/d(e) HH:mm:ss"
            },
            custom_log_start_observe_messages: {
                type: FormTypes.TEXT,
                key: "custom_log_start_observe_messages",
                name: "カスタムログ：メッセージ監視開始文",
                description: "&lt;time&gt;:監視開始日時"
            },
            custom_log_start_observe_talk: {
                type: FormTypes.TEXT,
                key: "custom_log_start_observe_talk",
                name: "カスタムログ：トーク監視開始文",
                description: "&lt;talkId&gt;:トークID, &lt;talkName&gt;:トーク名, &lt;time&gt;:監視開始日時"
            },
            custom_log_message_header: {
                type: FormTypes.TEXT,
                key: "custom_log_message_header",
                name: "カスタムログ：メッセージヘッダー",
                description: "&lt;talkId&gt;:トークID, &lt;talkName&gt;:トーク名, &lt;time&gt;:発言日時, &lt;userName&gt;:ユーザー名"
            }
        }
    };

    /** 設定項目データリスト */
    const SETTING_SECTION_DATAS = [
        SETTING_SECTION_MULTI_VIEW,
        SETTING_SECTION_WATCH_MESSAGE_DATA,
        SETTING_SECTION_LOG_DATA
    ];

    /** 機能 */
    const SETTINGS_KEY_FUNCTIONS = {
        responsive_multi_view: makeMultiViewResponsive,
        watch_message: watchMessage
    };

    //設定の初期化
    initializeSettings();

    //設定画面の描画
    drawSettingView();

    //設定の取得
    const settings = getSettings();

    //各種機能の実行
    for(const key in SETTINGS_KEY_FUNCTIONS){
        if(settings[key] === true){
            SETTINGS_KEY_FUNCTIONS[key]();
        }
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
        const hr = createElement(ElementTypes.HR);
        settingPage.appendChild(hr);

        //説明
        const description = createElement(ElementTypes.DIV, SETTING_DESCRIPTION);
        settingPage.appendChild(description);

        //設定項目
        SETTING_SECTION_DATAS.forEach(settingSectionData => drawSettingSection(settingPage, settingSectionData));
    }

    /**
    * 設定画面に設定項目を描画します。
    * @param {HTMLElement} settingPage 設定画面
    * @param {Object} settingSectionData 設定項目データ
    */
    function drawSettingSection(settingPage, settingSectionData){
        const inputKeyDatas = settingSectionData.inputKeyDatas;
        const settings = getSettings();

        //インプットフォーム要素の作成
        const inputKeyForms = convertObjectValue(inputKeyDatas, (key, data) => createSettingInputFormElement(data));
        const inputForms = Object.values(inputKeyForms);
        const section = createSettingSection(settingSectionData, inputForms);
        settingPage.appendChild(section);

        //フォームの初期値にローカルストレージの値を設定
        const inputKeyInputs = convertObjectValue(inputKeyForms, (key, form) => {
            const input = form.querySelector('#' + HTML_ID_PREFIX + key);
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
            return input;
        });

        //値が変更されたらボタンをクリック可能化
        const button = section.querySelector('.btn');
        const message = section.querySelector('.success');
        const onChangeValue = () => {
            const inputKeyInputValues = convertObjectValue(inputKeyInputs, (key, input) => {
                const inputData = inputKeyDatas[key];
                switch(inputData.type){
                    case FormTypes.TEXT:
                    case FormTypes.TEXT_ARRAY:
                        return input.value;
                    case FormTypes.CHECKBOX:
                        return input.checked;
                }
            });
            button.disabled = equalsInputValueToSettings(inputKeyInputValues, settings);
            setDisplay(message, DisplayTypes.NONE);
        };
        for(const key in inputKeyInputs){
            const input = inputKeyInputs[key];
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
        }

        //ボタンがクリックされたらローカルストレージの値を更新
        const onClickButton = () => {
            for(const key in inputKeyInputs){
                const input = inputKeyInputs[key];
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
            }

            setSettings(settings);
            button.disabled = true;
            setDisplay(message, DisplayTypes.INLINE);
        };
        addEventListener(button, EventTypes.CLICK, onClickButton);
    }

    /**
    * 設定画面のインプットフォーム要素を作成します。
    * @param {Object} inputData インプットデータ
    * @return {HTMLElement} インプットフォーム要素
    */
    function createSettingInputFormElement(inputData){
        const form = createElement(ElementTypes.DIV);
        setAttribute(form, AttributeTypes.CLASS, "form-group");
        const label = createElement(ElementTypes.LABEL);

        switch(inputData.type){
            case FormTypes.TEXT:
            case FormTypes.TEXT_ARRAY:
                setAttribute(label, AttributeTypes.CLASS, "control-label");
                label.innerText = inputData.name;

                const input = createElement(ElementTypes.INPUT);
                setAttribute(input, AttributeTypes.ID, HTML_ID_PREFIX + inputData.key);
                setAttribute(input, AttributeTypes.CLASS, "form-control");
                setAttribute(input, AttributeTypes.NAME, "status");

                const inputArea = createElement(ElementTypes.DIV);
                setAttribute(inputArea, AttributeTypes.CLASS, "controls");
                inputArea.appendChild(input);

                form.appendChild(label);
                form.appendChild(inputArea);

                if(inputData.description !== undefined){
                    const annotation = createElement(ElementTypes.DIV, inputData.description);
                    setAttribute(annotation, AttributeTypes.CLASS, "annotation");
                    form.appendChild(annotation);
                }
                break;
            case FormTypes.CHECKBOX:
                const checkbox = createElement(ElementTypes.INPUT);
                setAttribute(checkbox, AttributeTypes.ID, HTML_ID_PREFIX + inputData.key);
                setAttribute(checkbox, AttributeTypes.TYPE, "checkbox");

                const labelText = document.createTextNode(inputData.name);
                label.appendChild(checkbox);
                label.appendChild(labelText);

                const checkboxArea = createElement(ElementTypes.DIV);
                setAttribute(checkboxArea, AttributeTypes.CLASS, "checkbox");
                checkboxArea.appendChild(label);

                if(inputData.description !== undefined){
                    const annotation = createElement(ElementTypes.DIV, inputData.description);
                    setAttribute(annotation, AttributeTypes.CLASS, "annotation");
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
    * @return {HTMLElement} 項目要素
    */
    function createSettingSection(settingSectionData, inputKeyForms){
        const header = createElement(ElementTypes.DIV, settingSectionData.title);
        setAttribute(header, AttributeTypes.CLASS, "c-section__heading");

        let description;
        if(settingSectionData.description !== undefined){
            description = createElement(ElementTypes.DIV, settingSectionData.description);
            setAttribute(description, AttributeTypes.CLASS, "form-group");
        }

        const button = createElement(ElementTypes.BUTTON, "変更");
        setAttribute(button, AttributeTypes.TYPE, "button");
        setAttribute(button, AttributeTypes.CLASS, "btn btn-primary btn-fix");
        button.disabled = true;

        const message = createElement(ElementTypes.SPAN, "変更しました。");
        setAttribute(message, AttributeTypes.CLASS, "success");
        setDisplay(message, DisplayTypes.NONE);

        const buttonArea = createElement(ElementTypes.DIV);
        buttonArea.appendChild(button);
        buttonArea.appendChild(message);

        const section = createElement(ElementTypes.DIV);
        setAttribute(section, AttributeTypes.CLASS, "c-section");
        setAttribute(section, AttributeTypes.ID, HTML_ID_PREFIX + settingSectionData.key);
        section.appendChild(header);

        if(description !== undefined){
            section.appendChild(description);
        }

        Object.values(inputKeyForms).forEach(inputForm => section.appendChild(inputForm));
        section.appendChild(buttonArea);

        return section;
    }

    /**
    * すべてのインプット要素の値と設定の値が等しいかどうかを判定します。
    * @param {Ocject} inputKeyInputValues
    * @param {Object} settings 設定
    * @return {Boolean} すべて等しければtrue、それ以外はfalse
    */
    function equalsInputValueToSettings(inputKeyInputValues, settings){
        for(const key in inputKeyInputValues){
            const inputValue = inputKeyInputValues[key];
            const settingValue = Array.isArray(settings[key]) ? arrayToString(settings[key]) : settings[key];
            if(inputValue != settingValue){
                return false;
            }
        }
        return true;
    }

    /**
    * マルチビューをレスポンシブ化します。
    */
    function makeMultiViewResponsive(){
        const multiPanes = document.getElementById("talk-panes-multi");
        const talkPanes = multiPanes.querySelectorAll('.talk-pane');
        talkPanes.forEach(talkPane => {
            const talkPaneObserver = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    //class属性の変更でなければ次へ
                    if(mutation.attributeName != "class"){
                        return;
                    }

                    const activeTalkPanes = [];
                    const inactiveTalkPanes = [];
                    talkPanes.forEach(talkPane => {
                        const talkIsActive = talkPane.classList.contains("has-send-form");
                        if(talkIsActive){
                            activeTalkPanes.push(talkPane);
                        }else{
                            inactiveTalkPanes.push(talkPane);
                        }
                    });

                    //アクティブペインを外側から表示
                    activeTalkPanes.forEach(talkPane => {
                        setDisplay(talkPane, DisplayTypes.BLOCK);
                        const timelinebody = talkPane.querySelector('.timeline-body');
                        setDisplay(timelinebody, DisplayTypes.BLOCK);
                        const timelineHeader = talkPane.querySelector('.timeline-header');
                        const timelineFotter = talkPane.querySelector('.timeline-footer');
                        const timelineBodyHeight = talkPane.clientHeight - timelineHeader.clientHeight - timelineFotter.clientHeight;
                        setHeight(timelinebody, timelineBodyHeight);
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
    * メッセージを監視します。
    */
    function watchMessage(){
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
                            nodes.forEach(node => {
                                //メッセージではなければ次へ
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
        for(const key in object){
            const value = object[key];
            if(!object.hasOwnProperty(key) || typeof value != "object" || Object.isFrozen(value)){
                continue;
            }
            deepFreeze(value);
        }
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
    * @param {String} pattern パターン
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
    * @throws {Error} エラー
    */
    function deepCloneNode(node){
        return node.cloneNode(true);
    }

    /**
    * HTML要素を作成します。内部HTMLがあれば設定します。
    * @param {ElementType} type 要素種別
    * @param {String} [innerHTML] 内部HTML
    * @return {HTMLElement} HTML要素
    * @throws {Error} エラー
    */
    function createElement(type, innerHTML){
        if(!(type instanceof ElementType)){
            throw new Error("type is not instance of ElementType");
        }
        const div = document.createElement(type.value);
        if(innerHTML !== undefined){
            div.innerHTML = innerHTML;
        }
        return div;
    }

    /**
    * HTML要素の属性を設定します。
    * @param {HTMLElement} element HTML要素
    * @param {AttributeType} type 属性種別
    * @param {String} value 値
    * @throws {Error} エラー
    */
    function setAttribute(element, type, value){
        if(!(type instanceof AttributeType)){
            throw new Error("type is not instance of AttributeType");
        }
        element.setAttribute(type.value, value);
    }


    /**
    * HTML要素のディスプレイ属性を設定します。
    * @param {HTMLElement} element HTML要素
    * @param {DisplayType} type ディスプレイ種別
    * @throws {Error} エラー
    */
    function setDisplay(element, type){
        if(!(type instanceof DisplayType)){
            throw new Error("type is not instance of DisplayType");
        }
        setStyle(element, "display", type.value);
    }

    /**
    * HTML要素の高さを設定します。
    * @param {HTMLElement} element HTML要素
    * @param {Number} height 高さ（px）
    */
    function setHeight(element, height){
        setStyle(element, "height", height + "px");
    }

    /**
    * HTML要素のスタイルを設定します。
    * @param {HTMLElement} element HTML要素
    * @param {String} name 属性名
    * @param {String} value 値
    */
    function setStyle(element, name, value){
        element.style[name] = value;
    }

    /**
    * HTML要素にイベントを追加します。
    * @param {HTMLElement} element HTML要素
    * @param {EventType} type イベント種別
    * @param {Function} listener イベント発生時実行関数
    * @throws {Error} エラー
    */
    function addEventListener(element, type, listener){
        if(!(type instanceof EventType)){
            throw new Error("type is not instance of EventType");
        }
        element.addEventListener(type.value, listener, false);
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