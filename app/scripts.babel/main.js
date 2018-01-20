// ==UserScript==
// @name         direct helper
// @namespace    https://github.com/munierujp/direct_helper
// @version      1.8
// @description  directに便利な機能を追加します。
// @author       @munieru_jp
// @match       https://*.direct4b.com/home*
// @grant        none
// @require https://cdn.rawgit.com/munierujp/Optional.js/3fb1adf2825a9dad4499ecd906a4701921303ee2/Optional.min.js
// @require https://cdn.rawgit.com/munierujp/Observer.js/d0401132a1276910692fc53ed4012ef5efad25f3/Observer.min.js
// @require https://cdn.rawgit.com/munierujp/Replacer.js/dd9339ae54d7adfd6a65c54c299f5a485f327521/Replacer.min.js
// @require https://cdn.rawgit.com/munierujp/SuperMap.js/71bda32a1df6f9f76d6b5823eaf2caab318baead/SuperMap.min.js
// ==/UserScript==

(function(){
    'use strict';

    /** 値保持クラス */
    class HasValue{
        /**
        * @param {Object} value 値
        */
        constructor(value){
            this.value = value;
        }

        /**
        * HasValueオブジェクトを生成します。
        * @param {Object} value 値
        * @return {HasValue} HasValueオブジェクト
        */
        static of(value){
            return new this(value);
        }
    }

    /** トーク */
    class Talk{
        /**
        * @param {String} id トークID
        * @param {String} name トーク名
        */
        constructor(id, name){
            this.id = id;
            this.name = name;
        }

        /**
        * Talkオブジェクトを生成します。
        * @param {String} id トークID
        * @param {String} name トーク名
        * @return {Talk} Talkオブジェクト
        */
        static of(id, name){
            return new this(id, name);
        }
    }

    /** メッセージ */
    class Message{
        /**
        * @param {Talk} talk Talkオブジェクト
        * @throws {TypeError} talkの型がTalkではない場合
        */
        constructor(talk){
            if(!(talk instanceof Talk)){
                throw new TypeError(talk + " is not instance of Talk");
            }
            this.talk = talk;
        }

        /**
        * Messageオブジェクトを生成します。
        * @param {Talk} talk Talkオブジェクト
        * @return {Message} Messageオブジェクト
        */
        static of(talk){
            return new this(talk);
        }

        /**
        * メッセージをコンソールに出力します。
        * @param {Object} settings 設定
        */
        log(settings){
            const header = Replacer.of(
                [/<talkId>/g, this.talk.id],
                [/<time>/g, formatDate(this.time, settings.date_format)],
                [/<talkName>/g, this.talk.name],
                [/<userName>/g, this.userName]
            ).exec(settings.custom_log_message_header);

            console.group(header);
            Optional.ofAbsentable(this.stamp)
                .ifPresent(stamp => console.log(settings.log_label, this.body, stamp))
                .ifAbsent(() => console.log(settings.log_label, this.body));
            console.groupEnd();
        }
    }

    /** トークエリア */
    class TalkArea extends HasValue{
        /**
		* メッセージエリアの追加を監視します。
		* @param {Function} callback : messageArea => {...}
		*/
        observeAddingMessageArea(callback){
            const realMessageArea = this.value.querySelector('.real-msgs');
            Observer.of(realMessageArea).childList().hasChanged(records => {
                records.forEach(record => {
                    Array.from(record.addedNodes)
                        .filter(node => node.className == "msg")
                        .forEach(messageArea => callback(messageArea));
                });
            }).start();
        }
    }

    /** メッセージエリア */
    class MessageArea{
        /**
        * @param {Element} value メッセージエリア
        */
        constructor(value){
            this.value = value;
            this.$messageArea = $(this.value);
            this.$messageAreaFirstChild = this.$messageArea.find('div:first-child');
            this.$messageBodyArea = this.$messageAreaFirstChild.find('.msg-body');
            this.messageType = Object.values(MessageTypes).find(messageType => this.$messageBodyArea.hasClass(messageType.value));
        }

        /**
        * MessageAreaオブジェクトを生成します。
        * @param {Element} value メッセージエリア
        * @return {MessageArea} MessageAreaオブジェクト
        */
        static of(value){
            return new this(value);
        }

        /**
        * ユーザー名を取得します。
        * @param {Object} settings 設定
        * @return {String} ユーザー名
        */
        getUserName(settings){
            if(this.$messageAreaFirstChild.hasClass(UserTypes.SYSTEM.value)){
                return settings.user_name_system;
            }else if(this.$messageAreaFirstChild.hasClass(UserTypes.ME.value)){
                return $('#current-username').text();
            }else if(this.$messageAreaFirstChild.hasClass(UserTypes.OTHERS.value)){
                return this.$messageAreaFirstChild.find('.username').text();
            }
        }

        /**
        * 本文を取得します。
        * @param {Object} settings 設定
        * @return {String} 本文
        */
        getMessageBody(settings){
            const messageHasFile = this.messageType == MessageTypes.FILE || this.messageType == MessageTypes.FILE_AND_TEXT;
            const messageHasStamp = this.messageType == MessageTypes.STAMP;
            if(messageHasFile){
                const fileType = Object.values(FileTypes).find(fileType => this.$messageBodyArea.find('.msg-thumb').hasClass(fileType.value));
                const prefix = fileType == FileTypes.IMAGE ? settings.log_image : settings.log_file;
                const messageHasText = this.messageType == MessageTypes.FILE_AND_TEXT && !(this.$messageBodyArea.hasClass("no-text"));
                if(messageHasText){
                    const text =this.$messageBodyArea.find('.msg-thumbs-text').text();
                    return prefix + text;
                }else{
                    return prefix;
                }
            }else if(messageHasStamp){
                const stampType = Object.values(StampTypes).find(stampType => this.$messageBodyArea.hasClass(stampType.value));
                if(stampType == StampTypes.NO_TEXT){
                    return settings.log_stamp;
                }
            }

            //本文テキストのみを取得するために深く複製したノードからメッセージメニューを削除
            const $messageText = this.$messageBodyArea.find('.msg-text').clone();
            const $messageMenu = $messageText.find('.msg-menu-container');
            $messageMenu.remove();
            return $messageText.text();
        }

        /**
        * Messageオブジェクトを作成します。
        * @param {Object} settings 設定
        * @parm {Talk} talk Talkオブジェクト
        * @return {Message} Messageオブジェクト
        */
        createMessage(settings, talk){
            const message = Message.of(talk);
            message.type = this.messageType;
            message.time = new Date(Number(this.$messageArea.attr("data-created-at")));
            message.userName = this.getUserName(settings);
            message.body = this.getMessageBody(settings);

            if(this.messageType == MessageTypes.STAMP){
                message.stamp = this.$messageBodyArea.find('img').get(0);
            }

            return message;
        }
    }

    /** ファイル種別クラス */
    class FileType extends HasValue{}
    /** ファイル種別 */
    const FileTypes = {
        IMAGE: new FileType("msg-thumb-cover"),
        OTHER: new FileType()
    };

    /** フォーム種別クラス */
    class FormType{}
    /** フォーム種別 */
    const FormTypes = {
        CHECKBOX: new FormType(),
        NUMBER: new FormType(),
        RADIOBUTTON: new FormType(),
        TEXT: new FormType(),
        TEXT_ARRAY: new FormType()
    };

    /** キー種別クラス */
    class KeyType{
        /**
        * @param {String} key キー
        */
        constructor(key){
            this.key = key;
        }
    }
    /** キー種別 */
    const KeyTypes = {
        ESCAPE: new KeyType("Escape")
    };

    /** メッセージ種別クラス */
    class MessageType extends HasValue{}
    /** メッセージ種別 */
    const MessageTypes = {
        DELETED: new MessageType("msg-type-deleted"),
        FILE: new MessageType("msg-type-file"),
        FILE_AND_TEXT: new MessageType("msg-type-textMultipleFile"),
        STAMP: new MessageType("msg-type-stamp"),
        SYSTEM: new MessageType("msg-type-system"),
        TEXT: new MessageType("msg-type-text")
    };

    /** スタンプ種別クラス */
    class StampType extends HasValue{}
    /** スタンプ種別 */
    const StampTypes = {
        NO_TEXT: new StampType("no-text"),
        WITH_TEXT: new StampType("stamp-with-text-body")
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
        FileTypes,
        FormTypes,
        KeyTypes,
        MessageTypes,
        StampTypes,
        UserTypes
    ];
    //enumを深く凍結
    ENUMS.forEach(e => deepFreeze(e));

    /** id属性接頭辞 */
    const HTML_ID_PREFIX = "direct_helper-";

    /** ローカルストレージ設定キー */
    const LOCAL_STORAGE_SETTINGS_KEY = "direct_helper_settings";

    /** 設定データ */
    const SETTING_DATA = {
        key: "setting",
        name: "direct helper設定",
        description: `以下はdirect helperの設定です。設定変更後はページをリロードしてください。<br>
詳しい使用方法は<a href="https://github.com/munierujp/direct_helper/blob/master/README.md" target="_blank">readme</a>を参照してください。`,
        sections: [
            {
                key: "user-dialog-settings",
                name: "ユーザーダイアログ",
                description: "ユーザーダイアログの動作を変更します。",
                items: [
                    {
                        key: "expand_user_icon",
                        name: "ユーザーアイコンの拡大",
                        description: "ユーザーアイコンをクリックで拡大表示します。",
                        type: FormTypes.CHECKBOX,
                        default: true
                    }
                ]
            },
            {
                key: "talk-settings",
                name: "画像",
                description: "画像の動作を変更します。",
                items: [
                    {
                        key: "change_thumbnail_size",
                        name: "サムネイルサイズの変更",
                        description: "画像のサムネイルサイズを変更します。",
                        type: FormTypes.CHECKBOX,
                        default: true
                    },
                    {
                        key: "thumbnail_size",
                        name: "サムネイルサイズ",
                        description: "画像のサムネイルサイズ（px）を入力してください。",
                        type: FormTypes.NUMBER,
                        default: 600,
                        parentKey: "change_thumbnail_size"
                    },
                    {
                        key: "blur_thumbnail",
                        name: "サムネイル画像をぼかす",
                        description: "サムネイル画像にブラー効果をかけてぼかします。",
                        type: FormTypes.CHECKBOX,
                        default: true
                    },
                    {
                        key: "thumbnail_blur_grade",
                        name: "ぼかし度",
                        description: "サムネイル画像のぼかし度（px）を入力してください。",
                        type: FormTypes.NUMBER,
                        default: 0,
                        parentKey: "blur_thumbnail"
                    }
                ]
            },
            {
                key: "input-message-settings",
                name: "メッセージ入力",
                description: "メッセージ入力欄の動作を変更します。",
                items: [
                    {
                        key: "confirm_send_message_button",
                        name: "送信ボタンの確認",
                        description: "送信ボタンによるメッセージ送信前に確認します。",
                        type: FormTypes.CHECKBOX,
                        default: true
                    },
                    {
                        key: "show_message_count",
                        name: "入力文字数の表示",
                        description: "入力文字数を表示します。",
                        type: FormTypes.CHECKBOX,
                        default: true
                    },
                    {
                        key: "show_message_count_types",
                        name: "入力文字数の表示形式",
                        type: FormTypes.RADIOBUTTON,
                        default: "countdown",
                        parentKey: "show_message_count",
                        buttons: [
                            {
                                key: "countdown",
                                name: "カウントダウン"
                            },
                            {
                                key: "countup",
                                name: "カウントアップ"
                            }
                        ]
                    }
                ]
            },
            {
                key: "multi-view-settings",
                name: "マルチビュー",
                description: "マルチビューの動作を変更します。",
                items: [
                    {
                        key: "responsive_multi_view",
                        name: "マルチビューのレスポンシブ化",
                        description: "選択状態に応じてマルチビューのカラム数を動的に変更します。",
                        type: FormTypes.CHECKBOX,
                        default: true
                    }
                ]
            },
            {
                key: "message-watching-settings",
                name: "メッセージ監視",
                description: "メッセージを監視してコンソールに出力します。シングルビューでのみ動作します。",
                items: [
                    {
                        key: "watch_message",
                        name: "メッセージの監視",
                        description: "メッセージを監視してコンソールに出力します。",
                        type: FormTypes.CHECKBOX,
                        default: true
                    },
                    {
                        key: "show_past_message",
                        name: "過去メッセージの表示",
                        description: "監視開始以前のメッセージを表示します。",
                        type: FormTypes.CHECKBOX,
                        default: false,
                        parentKey: "watch_message"
                    },
                    {
                        key: "watch_default_observe_talk",
                        name: "デフォルト監視対象の自動監視",
                        description: "デフォルト監視トークIDで指定したトークが未読であれば、自動で監視します。",
                        type: FormTypes.CHECKBOX,
                        default: true,
                        parentKey: "watch_message"
                    },
                    {
                        key: "default_observe_talk_ids",
                        name: "デフォルト監視トークID",
                        description: 'HTMLのid属性のうち、"talk-_"で始まるものを半角カンマ区切りで入力してください。',
                        type: FormTypes.TEXT_ARRAY,
                        default: [],
                        parentKey: "watch_default_observe_talk"
                    }
                ]
            },
            {
                key: "log-settings",
                name: "ログ",
                description: "ログの表示形式をカスタマイズします。",
                items: [
                    {
                        key: "log_label",
                        name: "ログラベル",
                        description: "コンソールでのフィルター用の文字列です。",
                        type: FormTypes.TEXT,
                        default: ""
                    },
                    {
                        type: FormTypes.TEXT,
                        name: "システムユーザー名",
                        key: "user_name_system",
                        default: "システム"
                    },
                    {
                        key: "log_stamp",
                        name: "スタンプログ",
                        type: FormTypes.TEXT,
                        default: "[スタンプ]"
                    },
                    {
                        key: "log_image",
                        name: "画像ログ",
                        type: FormTypes.TEXT,
                        default: "[画像]"
                    },
                    {
                        key: "log_file",
                        name: "ファイルログ",
                        type: FormTypes.TEXT,
                        default: "[ファイル]"
                    },
                    {
                        key: "date_format",
                        name: "日付フォーマット",
                        description: "パターン文字で指定してください。 例：yyyy/M/d(e) HH:mm:ss",
                        type: FormTypes.TEXT,
                        default: "yyyy/M/d(e) HH:mm:ss"
                    },
                    {
                        key: "custom_log_start_observe_messages",
                        name: "メッセージ監視開始文",
                        description: "&lt;time&gt;:監視開始日時",
                        type: FormTypes.TEXT,
                        default: "<time> メッセージの監視を開始します。"
                    },
                    {
                        key: "custom_log_start_observe_talk",
                        name: "トーク監視開始文",
                        description: "&lt;talkId&gt;:トークID, &lt;talkName&gt;:トーク名, &lt;time&gt;:監視開始日時",
                        type: FormTypes.TEXT,
                        default: "<time> [<talkName>]の監視を開始します。"
                    },
                    {
                        key: "custom_log_message_header",
                        name: "メッセージヘッダー",
                        description: "&lt;talkId&gt;:トークID, &lt;talkName&gt;:トーク名, &lt;time&gt;:発言日時, &lt;userName&gt;:ユーザー名",
                        type: FormTypes.TEXT,
                        default: "<time> [<talkName>] <userName>"
                    }
                ]
            }
        ]
    };

    /** アイコン画像データ */
    const ICON_IMAFE_DATA = "data:image/png;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG3xQb/AAAKAAAAAAAAAAAAAAAAAAAA5AAAAJ0ASTuA/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAMAAAAAAAAAOEAAACkAAAAqABJO9QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAC8AAAAmQAAAMkAAP3qAEk+/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOaQ03JpdRTpAAAAAElFTkSuQmCC";

    /** 機能リスト（実行順） */
    const SETTINGS_KEY_ACTIONS = {
        blur_thumbnail: doBlurThumbnail,
        change_thumbnail_size: doChangeThumbnailSize,
        confirm_send_message_button: doConfirmSendMessageButton,
        expand_user_icon: doExpandUserIcon,
        responsive_multi_view: doResponsiveMultiView,
        show_message_count: doShowMessageCount,
        watch_message: doWatchMessage
    };

    //設定の初期化
    initializeSettings();

    //設定画面の描画
    drawSettingView();

    //各種機能の実行
    doActions();

    /**
    * 設定を初期化します。
    */
    function initializeSettings(){
        const settings = getSettings();

        //未設定項目にデフォルト値を設定
        SETTING_DATA.sections.forEach(section => {
            section.items.filter(item => settings[item.key] === undefined).forEach(item => settings[item.key] = item.default);
        });

        setSettings(settings);
    }

    /**
    * 設定画面を描画します。
    */
    function drawSettingView(){
        const CLASS_ACTIVE_ITEM = "active";

        //右ナビゲーションバーに設定メニューを追加
        const $settingMenuItem = $(`<li></li>`).css("cursor", "pointer");
		const settingLinkId = `navbar-menu-${HTML_ID_PREFIX}${SETTING_DATA.key}`;
        const $settingMenuLink = $(`<a id="${settingLinkId}" class="navbar-menu" data-original-title="${SETTING_DATA.name}"></a>`);
        $settingMenuLink.append(`<span><img src="${ICON_IMAFE_DATA}"></span>`);
        $settingMenuLink.append(`<span class="navbar-menu-text">${SETTING_DATA.name}</span>`);
        $settingMenuItem.append($settingMenuLink);
        $('.navbar-right').append($settingMenuItem);

        //設定ページを追加
        const $environmentPage = $('#environment-page');
		const settingPageId = `${HTML_ID_PREFIX}${SETTING_DATA.key}-page`;
        const $settingPage = $(`<div class="page" id="${settingPageId}"></div>`).css({
            "max-width": $environmentPage.css("max-width"),
            "margin-left": $environmentPage.css("margin-left"),
            "margin-right": $environmentPage.css("margin-right"),
            "height": $environmentPage.css("max-width"),
            "padding-bottom": $environmentPage.css("padding-bottom")
        });
        $settingPage.append(`<h3 class="page-title"><span class="page-title-glyphicon glyphicon glyphicon-cog"></span>  ${SETTING_DATA.name}</h3>`);
        $settingPage.append(`<div>${SETTING_DATA.description}</div>`);
        SETTING_DATA.sections.forEach(section => appendSettingSection($settingPage, section));
        $settingPage.hide();
        $settingPage.insertAfter($environmentPage);

		const $menuItems = $('#navbar-menu li');
		const $pages = $('#wrap .page');

        //設定メニュークリック時にページ表示を切り替え
        $settingMenuItem.on("click.direct_helper_drawSettingView", () => {
            //表示中のページを非表示
            $menuItems.filter((i, menuItem) => $(menuItem).hasClass(CLASS_ACTIVE_ITEM)).each((i, menuItem) => $(menuItem).removeClass(CLASS_ACTIVE_ITEM));
            $pages.filter((i, page) => $(page).is(':visible')).each((i, page) => $(page).hide());

            //設定ページを表示
            $settingMenuItem.addClass(CLASS_ACTIVE_ITEM);
			$settingPage.show();
        });

        //左ナビゲーションバーのメニュークリック時にページ表示を切り替え
        $('.navbar-left > li').on("click.direct_helper_drawSettingView", event => {
            //設定ページを非表示
			$settingMenuItem.removeClass(CLASS_ACTIVE_ITEM);
			$settingPage.hide();

            //クリックしたページを表示
			const $menuItem = $(event.currentTarget);
            $menuItem.addClass(CLASS_ACTIVE_ITEM);
            const linkId = $menuItem.find('a').attr("id");
            const pageId = linkId.replace(/navbar-menu-(.+)/, "$1-page");
            const page = $(`#${pageId}`);
            page.show();
        });

		//他のページ表示時にページ表示を切り替え
		$pages.filter((i, page) => $(page).attr("id") !== settingPageId).each((i, page) => {
			Observer.of(page).attributes("style").hasChanged(records => {
				const visiblePages = records.map(record => record.target).filter(page => $(page).is(':visible'));
				if(visiblePages.length){
					//設定ページを非表示
					$settingMenuItem.removeClass(CLASS_ACTIVE_ITEM);
					$settingPage.hide();
				}
			}).start();
		});
    }

    /**
    * 設定画面に項目を追加します。
    * @param {jQuery} $settingPage 設定画面オブジェクト
    * @param {Object} section 設定セクション
    */
    function appendSettingSection($settingPage, section){
        const arrayToMap = array => {
            const map = SuperMap.empty();
            array.forEach((element, index) => map.set(index, element));
            return map;
        };

        const settings = getSettings();

        //設定項目の作成
        const $section = $(`<div id="${HTML_ID_PREFIX + section.key}" class="c-section"><div class="c-section__heading">${section.name}</div></div>`);
        Optional.ofAbsentable(section.description).ifPresent(description => $section.append(`<div class="form-group">${description}</div>`));
        const settingItemMap = arrayToMap(section.items).mapKey((item, key) => item.key);
        const formGroupMap = settingItemMap.mapValue(item => createSettingFormGroup(item));
        formGroupMap.forEach($formGroup => $section.append($formGroup));
        $section.append(`<div><button type="button" class="btn btn-primary btn-fix" disabled>変更</button><span class="success" style="display:none">変更しました。</span></div>`);
        $settingPage.append($section);

        //フォームの初期値を設定
        const inputMap = formGroupMap.mapValue(($formGroup, key) => $settingPage.find(`#${HTML_ID_PREFIX}${key}`));
        inputMap.forEach(($input, key) => {
            const item = settingItemMap.get(key);
            const value = settings[key];
            switch(item.type){
                case FormTypes.TEXT:
                case FormTypes.TEXT_ARRAY:
                case FormTypes.NUMBER:
                    $input.val(value);
                    break;
                case FormTypes.CHECKBOX:
                    $input.prop("checked", value);
                    break;
                case FormTypes.RADIOBUTTON:
                    const $button = $settingPage.find(`#${HTML_ID_PREFIX}${key}_${value}`);
                    $button.prop("checked", true);
                    break;
            }

            //親が無効な場合、子の値を変更不可能化
            Optional.ofAbsentable(item.parentKey).ifPresent(parentKey => {
                const parentItem = settingItemMap.get(parentKey);
                if(parentItem.type == FormTypes.CHECKBOX){
                    const $parentInput = $settingPage.find(`#${HTML_ID_PREFIX}${parentKey}`);
                    const parentIsUnchecked = $parentInput.prop("checked") === false;
                    switch(item.type){
                        case FormTypes.TEXT:
                        case FormTypes.TEXT_ARRAY:
                        case FormTypes.NUMBER:
                        case FormTypes.CHECKBOX:
                            $input.prop("disabled", parentIsUnchecked);
                            break;
                        case FormTypes.RADIOBUTTON:
                            const $buttons = $input.find('input');
                            $buttons.each((i, button) => $(button).prop("disabled", parentIsUnchecked));
                            break;
                    }
                }
            });
        });

        //値変更時に変更ボタンをクリック可能化
        const $changeButton = $section.find('.btn');
        const $message = $section.find('.success');
        const onChangeValue = () => {
            const inputValueMap = inputMap.mapValue(($input, key) => {
                const item = settingItemMap.get(key);
                switch(item.type){
                    case FormTypes.TEXT:
                    case FormTypes.TEXT_ARRAY:
                    case FormTypes.NUMBER:
                        return $input.val();
                    case FormTypes.CHECKBOX:
                        return $input.prop("checked");
                    case FormTypes.RADIOBUTTON:
                        const $buttons =  $settingPage.find(`[name="${HTML_ID_PREFIX}${key}"]`);
                        const $checkedButton = $buttons.filter((i, button) => button.checked === true);
                        const id = $checkedButton.prop("id");
                        return id.replace(HTML_ID_PREFIX, "").replace(key + "_", "");
                }
            });

            const valuesIsAllMatch= Array.from(inputValueMap.entries()).every(entry => {
                const key = entry[0];
                const inputValue = entry[1];
                const settingValue = Array.isArray(settings[key]) ? arrayToString(settings[key]) : settings[key];
                return inputValue == settingValue;
            });
            $changeButton.prop("disabled", valuesIsAllMatch);
            $message.hide();
        };
        inputMap.forEach(($input, key) => {
            const item = settingItemMap.get(key);
            switch(item.type){
                case FormTypes.TEXT:
                case FormTypes.TEXT_ARRAY:
                case FormTypes.NUMBER:
                    $input.on("input.direct_helper_appendSettingSection", onChangeValue);
                    break;
                case FormTypes.CHECKBOX:
                    $input.on("click.direct_helper_appendSettingSection", onChangeValue);
                    break;
                case FormTypes.RADIOBUTTON:
                    const $buttons =  $settingPage.find(`#${HTML_ID_PREFIX}${key}`);
                    $buttons.each((i, button) => $(button).on("click.direct_helper_appendSettingSection", onChangeValue));
                    break;
            }

            //親が無効な場合、子の値を変更不可能化
            Optional.ofAbsentable(item.parentKey).ifPresent(parentKey => {
                const parentItem = settingItemMap.get(parentKey);
                if(parentItem.type == FormTypes.CHECKBOX){
                    const $parentInput =  $settingPage.find(`#${HTML_ID_PREFIX}${parentKey}`);
                    $parentInput.on("click.direct_helper_appendSettingSection", () => {
                        const parentIsUnchecked = $parentInput.prop("checked") === false;
                        switch(item.type){
                            case FormTypes.TEXT:
                            case FormTypes.TEXT_ARRAY:
                            case FormTypes.NUMBER:
                            case FormTypes.CHECKBOX:
                                $input.prop("disabled", parentIsUnchecked);
                                break;
                            case FormTypes.RADIOBUTTON:
                                const $buttons = $input.find('input');
                                $buttons.each((i, button) => $(button).prop("disabled", parentIsUnchecked));
                                break;
                        }
                    });
                }
            });
        });

        //変更ボタンクリック時に設定を更新
        $changeButton.on("click.direct_helper_appendSettingSection", () => {
            inputMap.forEach(($input, key) => {
                const item = settingItemMap.get(key);
                switch(item.type){
                    case FormTypes.TEXT:
                    case FormTypes.NUMBER:
                        settings[key] = $input.val();
                        break;
                    case FormTypes.TEXT_ARRAY:
                        settings[key] = stringToArray($input.val());
                        break;
                    case FormTypes.CHECKBOX:
                        settings[key] = $input.prop("checked");
                        break;
                    case FormTypes.RADIOBUTTON:
                        const $buttons = $input.find('input');
                        const $checkedButton = $buttons.filter((i, button) => button.checked === true);
                        const id = $checkedButton.prop("id");
                        settings[key] = id.replace(HTML_ID_PREFIX, "").replace(key + "_", "");
                        break;
                }
            });

            setSettings(settings);
            $changeButton.prop("disabled", true);
            $message.show();
        });
    }

    /**
    * 設定画面のフォームグループオブジェクトを作成します。
    * @param {Object} item 設定アイテム
    * @return {jQuery} フォームグループオブジェクト
    */
    function createSettingFormGroup(item){
        if(item.type == FormTypes.TEXT || item.type == FormTypes.TEXT_ARRAY){
            const $formGroup = $(`<div class="form-group"></div>`);
            $formGroup.append(`<label class="control-label">${item.name}</label>`);
            const id = HTML_ID_PREFIX + item.key;
            $formGroup.append(`<div class="controls"><input id="${id}" class="form-control" name="status"></div>`);
            Optional.ofAbsentable(item.description).ifPresent(description => $formGroup.append(`<div class="annotation">${description}</div>`));
            return $formGroup;
        }else if(item.type == FormTypes.NUMBER){
            const $formGroup = $(`<div class="form-group"></div>`);
            $formGroup.append(`<label class="control-label">${item.name}</label>`);
            const id = HTML_ID_PREFIX + item.key;
            $formGroup.append(`<div class="controls"><input type="number" id="${id}" class="form-control" name="status"></div>`);
            Optional.ofAbsentable(item.description).ifPresent(description => $formGroup.append(`<div class="annotation">${description}</div>`));
            return $formGroup;
        }else if(item.type == FormTypes.CHECKBOX){
            const $formGroup = $(`<div class="form-group"></div>`);
            const $checkboxArea = $(`<div class="checkbox"></div>`);
            const id = HTML_ID_PREFIX + item.key;
            $checkboxArea.append(`<label><input id="${id}" type="checkbox">${item.name}</label>`);
            Optional.ofAbsentable(item.description).ifPresent(description => $checkboxArea.append(`<div class="annotation">${description}</div>`));
            $formGroup.append($checkboxArea);
            return $formGroup;
        }else if(item.type == FormTypes.RADIOBUTTON){
            const id = HTML_ID_PREFIX + item.key;
            const $formGroup = $(`<div class="form-group" id="${id}"></div>`);
            $formGroup.append(`<label class="control-label">${item.name}</label>`);
            Optional.ofAbsentable(item.description).ifPresent(description => $formGroup.append(`<div class="annotation">${description}</div>`));
            item.buttons.forEach(button => {
                const $radioButtonArea = $(`<div class="radio"></div>`);
                const name = HTML_ID_PREFIX + item.key;
                const id = HTML_ID_PREFIX + item.key + "_" + button.key;
                $radioButtonArea.append(`<label><input type="radio" name="${name}" id="${id}">${button.name}</label>`);
                Optional.ofAbsentable(button.description).ifPresent(description => $radioButtonArea.append(`<div class="annotation">${description}</div>`));
                $formGroup.append($radioButtonArea);
            });
            return $formGroup;
        }
    }

    /**
	* 各種機能を実行します。
	*/
    function doActions(){
        const settings = getSettings();

        Object.keys(SETTINGS_KEY_ACTIONS)
            .filter(key => settings[key] === true)
            .map(key => SETTINGS_KEY_ACTIONS[key])
            .forEach(action => action());
    }

    /**
	* サムネイル画像をぼかす機能を実行します。
	*/
    function doBlurThumbnail(){
        const settings = getSettings();

        //トークエリアの追加を監視
        observeAddingTalkArea(talkArea => {
            //メッセージの追加を監視
            TalkArea.of(talkArea).observeAddingMessageArea(messageArea => {
                const messageType = MessageArea.of(messageArea).messageType;
                const messageHasFile = messageType == MessageTypes.FILE || messageType == MessageTypes.FILE_AND_TEXT;
                if(messageHasFile){
                    const $thumbnailArea = $(messageArea).find('.msg-text-contained-thumb');
                    const $thumbnails = $thumbnailArea.find('img');
                    $thumbnails.each((i, thumbnail) => $(thumbnail).css("filter", `blur(${settings.thumbnail_blur_grade}px)`));
                }
            });
        });
    }

    /**
	* サムネイルサイズの変更機能を実行します。
	*/
    function doChangeThumbnailSize(){
        const settings = getSettings();

        //トークエリアの追加を監視
        observeAddingTalkArea(talkArea => {
            //メッセージの追加を監視
            TalkArea.of(talkArea).observeAddingMessageArea(messageArea => {
                const messageType = MessageArea.of(messageArea).messageType;
                const messageHasFile = messageType == MessageTypes.FILE || messageType == MessageTypes.FILE_AND_TEXT;
                if(messageHasFile){
                    const $thumbnailArea = $(messageArea).find('.msg-text-contained-thumb');
                    $thumbnailArea.width(settings.thumbnail_size);
                }
            });
        });
    }

    /**
    * 送信ボタンの確認機能を実行します。
    */
    function doConfirmSendMessageButton(){
        const CONFIRM_MESSAGE = "本当に送信しますか？";

        const $sendForms = $('.form-send');
        $sendForms.each((i, sendForm) => {
            const $sendButton = $(sendForm).find('.form-send-button');

            //ダミー送信ボタンを作成
            const $dummySendButton = $sendButton.clone();
            $dummySendButton.prop("disabled", true);
            const $sendButtonGroup = $(sendForm).find('.form-send-button-group');
            $sendButtonGroup.append($dummySendButton);

            //送信ボタンを非表示化
            $sendButton.hide();

            //文字入力時にダミー送信ボタンをクリック可能化
            const $textArea = $(sendForm).find('.form-send-text');
            $textArea.on("input.direct_helper_doConfirmSendMessageButton", () => {
                const textAreaIsEmpty = $textArea.val() === "";
                $dummySendButton.prop("disabled", textAreaIsEmpty);
            });

            //添付ファイル追加時にダミー送信ボタンをクリック可能化
            const $fileAreas = $(sendForm).find('.staged-files');
            $fileAreas.each((i, fileArea) => {
                Observer.of(fileArea).attributes("style").hasChanged(records => {
                    records.forEach(record => {
                        const fileAreaIsHidden= $(fileArea).is(':hidden');
                        $dummySendButton.prop("disabled", fileAreaIsHidden);
                    });
                }).start();
            });

            //ダミー送信ボタンクリック時に確認ダイアログを表示
            $dummySendButton.on("click.direct_helper_doConfirmSendMessageButton", () => {
                if(window.confirm(CONFIRM_MESSAGE)){
                    $sendButton.click();
                }else{
                    //なにもしない
                }
            });
        });
    }

    /**
    * ユーザーアイコンの拡大機能を実行します。
    */
    function doExpandUserIcon(){
        const CUSTOM_MODAL_Z_INDEX = 9999;

        const addEscapeKeyupListener = listener => $(document).on("keyup.direct_helper_doExpandUserIcon_onEscapeKeyup", listener);
        const removeEscapeKeyupListener = () => $(document).off("keyup.direct_helper_doExpandUserIcon_onEscapeKeyup");

        const $userDialog = $('#user-dialog-basic-profile');
        const $icon = $userDialog.find('.prof-icon-large');

        //アイコンのマウスカーソルを変更
        $icon.css("cursor", "zoom-in");

        //アイコンクリック時に拡大画像を表示
        $icon.on("click.direct_helper_doExpandUserIcon_onClickIcon",  () => {
            const $image = $icon.find('img');
            const backgroundImage = $image.css("background-image");
            const url = backgroundImage.match(/url\("(.+)"\)/)[1];

            //モーダルで背景を暗くする
            const $modal = $('.modal-backdrop');
            const modalZIndex = $modal.css("z-index");
            $modal.css("z-index", CUSTOM_MODAL_Z_INDEX);

            //拡大画像エリアを作成
            const $expandedImageArea = $(`<div></div>`).css({
                "position": "fixed",
                "top": 0,
                "left": 0,
                "width": "100%",
                "height": "100%",
                "display": "flex",
                "align-items": "center",
                "justify-content": "center",
                "z-index": CUSTOM_MODAL_Z_INDEX + 1,
                "cursor": "zoom-out "
            });

            //拡大画像を作成
            const $expandedImage = $(`<img src="${url}">`).css({
                "max-width": "100%",
                "max-height": "100%"
            });
            $expandedImageArea.append($expandedImage);
            $('body').append($expandedImageArea);

            const closeExpandedImage = () => {
                $expandedImageArea.remove();
                $modal.css("z-index", modalZIndex);
            };

            //Escapeキー押下時に拡大画像エリアを閉じる
            addEscapeKeyupListener(event => {
                if(event.key == KeyTypes.ESCAPE.key){
                    closeExpandedImage();
                    removeEscapeKeyupListener();
                }
            });

            //拡大画像エリアクリック時に拡大画像を閉じる
            $expandedImageArea.on("click.direct_helper_doExpandUserIcon_onClickExpandedImageArea", () => {
                closeExpandedImage();
                removeEscapeKeyupListener();

                //拡大画像エリアクリック後にEscapeキー押下時にユーザーダイアログを閉じる
                addEscapeKeyupListener(event => {
                    if(event.key == KeyTypes.ESCAPE.key){
                        const $userModal = $('#user-modal');
                        $userModal.click();
                    }
                });
            });
        });
    }

    /**
    * マルチビューのレスポンシブ化機能を実行します。
    */
    function doResponsiveMultiView(){
        const $multiPaneArea = $('#talk-panes-multi');
        const $talkPanes = $multiPaneArea.find('.talk-pane');
        const $firstTalkPane = $talkPanes.first();
        const $firstTimelineHeader = $firstTalkPane.find('.timeline-header');
        const firstTalkPaneColor = $firstTimelineHeader.css("background-color");

        $talkPanes.each((i, talkPane) => {
            //トークペインのclass属性変更時、表示を切り替え
            Observer.of(talkPane).attributes("class").hasChanged(records => {
                records.forEach(record => {
                    const $activeTalkPanes = $talkPanes.filter((i, talkPane) => $(talkPane).hasClass("has-send-form"));
                    const $inactiveTalkPanes = $talkPanes.filter((i, talkPane) => $(talkPane).hasClass("no-send-form"));

                    //アクティブペインを外側から表示
                    $activeTalkPanes.each((i, talkPane) => {
                        $(talkPane).show();
                        const $timelinebody = $(talkPane).find('.timeline-body');
                        $timelinebody.show();
                        const $timelineHeader = $(talkPane).find('.timeline-header');
                        const $timelineFotter = $(talkPane).find('.timeline-footer');
                        $timelinebody.height($(talkPane).prop("clientHeight") - $timelineHeader.prop("clientHeight") - $timelineFotter.prop("clientHeight"));
                        $timelinebody.scrollTop($timelinebody.prop("scrollHeight"));
                    });

                    //非アクティブペインを内側から非表示
                    $inactiveTalkPanes.each((i, talkPane) => {
                        const $timelinebody = $(talkPane).find('.timeline-body');
                        $timelinebody.hide();
                        $(talkPane).hide();
                    });

                    //アクティブペインがない場合は1番目のペインの空ビューを表示
                    if($activeTalkPanes.length === 0){
                        $firstTalkPane.show();
                        const $emptyView = $firstTalkPane.find('.empty-view-container-for-timeline');
                        $emptyView.removeClass("hide");
                        $firstTimelineHeader.css("background-color", "#ffffff");
                    }else{
                        $firstTimelineHeader.css("background-color", firstTalkPaneColor);
                    }
                });
            }).start();
        });
    }

    /**
    * 入力文字数の表示機能を実行します。
    */
    function doShowMessageCount(){
        const settings = getSettings();
        const countDown = settings.show_message_count_types== "countdown";

        const sendForms = $('.form-send');
        sendForms.each((i, sendForm) => {
            const $textArea = $(sendForm).find('.form-send-text');
            const maxLength = $textArea.prop("maxLength");

            //カウンターを作成
            const count = countDown ? maxLength : 0;
            const $counter = $(`<label>${count}</label>`).css("margin-right", "8px");
            const $sendButtonGroup = $(sendForm).find('.form-send-button-group');
            $sendButtonGroup.prepend($counter);

            //文字入力時にカウンターの値を更新
            $textArea.on("input.direct_helper_doShowMessageCount", () => {
                const currentLength = $textArea.val().length;
                const count = countDown ? maxLength - currentLength : currentLength;
                $counter.text(count);
            });
        });
    }

    /**
    * メッセージの監視機能を実行します。
    */
    function doWatchMessage(){
        const settings = getSettings();

        const talkIsRead = talkId => {
            const $talk = $(`#${talkId}`);
            const $cornerBadge = $talk.find('.corner-badge');
            return $cornerBadge.length === 0;
        };

        const talkMap = new Map();
        const observingTalkIds = [];

        //トーク一覧に子ノード追加時、トーク関連処理を実行
        const $talkLists = $('#talks');
        $talkLists.each((i, talkList) => {
            Observer.of(talkList).childList().hasChanged(records => {
                //デフォルト監視対象を監視対象に追加
                if(settings.watch_default_observe_talk === true){
                    const readTalkIds = settings.default_observe_talk_ids.filter(talkIsRead);

                    //既読デフォルト監視トークを監視対象に追加
                    const talkIsNotObserving = talkId => !observingTalkIds.includes(talkId);
                    readTalkIds.filter(talkIsNotObserving).forEach((talkId, index) => {
                        const $talk = $(`#${talkId}`);
                        observingTalkIds.push(talkId);

                        //監視対象に追加するためにクリック
                        $talk.click();

                        //最後の場合はトークを閉じるために2回クリック
                        const talkIsLast = index == readTalkIds.length -1;
                        if(talkIsLast){
                            $talk.click();
                        }
                    });
                }

                //トーク情報の更新
                records.forEach(record => {
                    const talkItems = record.addedNodes;
                    talkItems.forEach(talkItem => {
                        const talkId = talkItem.id;
                        const talkName = $(talkItem).find('.talk-name-part').text();
                        const talk = Talk.of(talkId, talkName);
                        talk.isRead = talkIsRead(talkId);
                        talkMap.set(talkId, talk);
                    });
                });
            }).start();
        });

        //メッセージ監視開始ログを表示
        const observeStartMessage = Replacer.of(
            [/<time>/g, formatDate(new Date(), settings.date_format)]
        ).exec(settings.custom_log_start_observe_messages);
        console.info(settings.log_label, observeStartMessage);

        //トークエリアの追加を監視
        observeAddingTalkArea(talkArea => {
            //トークを生成
            const talkId = talkArea.id.replace(/(multi\d?-)?msgs/, "talk");
            const talk = talkMap.get(talkId);

            //トーク監視開始ログを表示
            const observeStartDate = new Date();
            const observeStartMessage = Replacer.of(
                [/<talkId>/g, talk.id],
                [/<time>/g, formatDate(observeStartDate, settings.date_format)],
                [/<talkName>/g, talk.name]
            ).exec(settings.custom_log_start_observe_talk);
            console.info(settings.log_label, observeStartMessage);

            //メッセージの追加を監視
            TalkArea.of(talkArea).observeAddingMessageArea(messageArea => {
                //メッセージを生成
                const message = MessageArea.of(messageArea).createMessage(settings, talk);

                //メッセージをコンソールに出力
                const messageIsNotPast = message.time > observeStartDate;
                if(messageIsNotPast || settings.show_past_message === true){
                    message.log(settings);
                }
            });
        });
    }

    /**
    * トークエリアの追加を監視します。
    * @param {Function} callback : talkArea => {...}
    */
    function observeAddingTalkArea(callback){
        const $messagesAreas = $('#messages');
        $messagesAreas.each((i, messagesArea) => {
            //メッセージエリアに子ノード追加時、トークエリア関連処理を実行
            Observer.of(messagesArea).childList().hasChanged(records => {
                records.forEach(record => {
                    const talkAreas = record.addedNodes;
                    talkAreas.forEach(talkArea => callback(talkArea));
                });
            }).start();
        });
    }

    /**
    * オブジェクトを深く凍結します。
    * @param {Object} object オブジェクト
    */
    function deepFreeze(object){
        Object.freeze(object);
        Object.keys(object).forEach(key => {
            const value = object[key];
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
        return Replacer.of(
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
        ).exec(pattern);
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
