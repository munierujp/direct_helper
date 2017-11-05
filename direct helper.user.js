// ==UserScript==
// @name         direct helper
// @namespace    https://github.com/munierujp/direct_helper
// @version      1.6
// @description  directに便利な機能を追加します。
// @author       @munieru_jp
// @match       https://*.direct4b.com/home*
// @grant        none
// @require https://cdn.rawgit.com/munierujp/Optional.js/3fb1adf2825a9dad4499ecd906a4701921303ee2/Optional.min.js
// @require https://cdn.rawgit.com/munierujp/Iterator.js/f52c3213ea519c4b81f2a2d800916aeea6e21a3f/Iterator.min.js
// @require https://cdn.rawgit.com/munierujp/Observer.js/d0401132a1276910692fc53ed4012ef5efad25f3/Observer.min.js
// @require https://cdn.rawgit.com/munierujp/Replacer.js/dd9339ae54d7adfd6a65c54c299f5a485f327521/Replacer.min.js
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

	/** ラジオボタンリスト */
	class RadioButtons extends HasValue{
		/**
		* チェックされているボタンを返します。
		* チェックされているボタンがない場合、undefinedを返します。
		* @return {HTMLElement} ラジオボタン要素
		*/
		findChecked(){
			return Array.from(this.value).find(button => button.checked === true);
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
	}

	/** メッセージ */
	class Message{
		/**
        * @param {Talk} talk トーク
        * @throws {TypeError} talkの型がTalkではない場合
        */
		constructor(talk){
			if(!(talk instanceof Talk)){
				throw new TypeError(talk + " is not instance of Talk");
			}
			this.talk = talk;
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
			Observer.of(realMessageArea).childList().hasChanged(mutations => {
				mutations.forEach(mutation => {
					Array.from(mutation.addedNodes)
						.filter(node => node.className == "msg")
						.forEach(messageArea => callback(messageArea));
				});
			}).start();
		}
	}

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
		H3: new ElementType("h3"),
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
		INPUT: new EventType("input"),
		KEYDOWN: new EventType("keydown"),
		KEYPRESS: new EventType("keypress"),
		KEYUP: new EventType("keyup")
	};

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
		DisplayTypes,
		ElementTypes,
		EventTypes,
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
		name: "direct helper設定",
		description: `以下はdirect helperの設定です。設定変更後はページをリロードしてください。<br>
詳しい使用方法は<a href="https://github.com/munierujp/direct_helper/blob/master/README.md" target="_blank">readme</a>を参照してください。`,
		sections: [
			{
				key: "user-dialog-settings",
				name: "ユーザーダイアログ",
				description: "ユーザーダイアログの動作を変更します。",
				items: {
					expand_user_icon: {
						key: "expand_user_icon",
						name: "ユーザーアイコンの拡大",
						description: "ユーザーアイコンをクリックで拡大表示します。",
						type: FormTypes.CHECKBOX,
						defaultValue: true
					}
				}
			},
			{
				key: "talk-settings",
				name: "画像",
				description: "画像の動作を変更します。",
				items: {
					change_thumbnail_size: {
						key: "change_thumbnail_size",
						name: "サムネイルサイズの変更",
						description: "画像のサムネイルサイズを変更します。",
						type: FormTypes.CHECKBOX,
						defaultValue: true
					},
					thumbnail_size: {
						key: "thumbnail_size",
						name: "サムネイルサイズ",
						description: "画像のサムネイルサイズ（px）を入力してください。",
						type: FormTypes.NUMBER,
						defaultValue: 600,
						parentKey: "change_thumbnail_size"
					},
					blur_thumbnail: {
						key: "blur_thumbnail",
						name: "サムネイル画像をぼかす",
						description: "サムネイル画像にブラー効果をかけてぼかします。",
						type: FormTypes.CHECKBOX,
						defaultValue: true
					},
					thumbnail_blur_grade: {
						key: "thumbnail_blur_grade",
						name: "ぼかし度",
						description: "サムネイル画像のぼかし度（px）を入力してください。",
						type: FormTypes.NUMBER,
						defaultValue: 0,
						parentKey: "blur_thumbnail"
					}
				}
			},
			{
				key: "input-message-settings",
				name: "メッセージ入力",
				description: "メッセージ入力欄の動作を変更します。",
				items: {
					confirm_send_message_button: {
						key: "confirm_send_message_button",
						name: "送信ボタンの確認",
						description: "送信ボタンによるメッセージ送信前に確認します。",
						type: FormTypes.CHECKBOX,
						defaultValue: true
					},
					show_message_count: {
						key: "show_message_count",
						name: "入力文字数の表示",
						description: "入力文字数をカウントダウン形式で表示します。",
						type: FormTypes.CHECKBOX,
						defaultValue: true
					}
				}
			},
			{
				key: "multi-view-settings",
				name: "マルチビュー",
				description: "マルチビューの動作を変更します。",
				items: {
					responsive_multi_view: {
						key: "responsive_multi_view",
						name: "マルチビューのレスポンシブ化",
						description: "選択状態に応じてマルチビューのカラム数を動的に変更します。",
						type: FormTypes.CHECKBOX,
						defaultValue: true
					}
				}
			},
			{
				key: "message-watching-settings",
				name: "メッセージ監視",
				description: "メッセージを監視してコンソールに出力します。シングルビューでのみ動作します。",
				items: {
					watch_message: {
						key: "watch_message",
						name: "メッセージの監視",
						description: "メッセージを監視してコンソールに出力します。",
						type: FormTypes.CHECKBOX,
						defaultValue: true
					},
					show_past_message: {
						key: "show_past_message",
						name: "過去メッセージの表示",
						description: "監視開始以前のメッセージを表示します。",
						type: FormTypes.CHECKBOX,
						defaultValue: false,
						parentKey: "watch_message"
					},
					watch_default_observe_talk: {
						key: "watch_default_observe_talk",
						name: "デフォルト監視対象の自動監視",
						description: "デフォルト監視トークIDで指定したトークが未読であれば、自動で監視します。",
						type: FormTypes.CHECKBOX,
						defaultValue: true,
						parentKey: "watch_message"
					},
					default_observe_talk_ids: {
						key: "default_observe_talk_ids",
						name: "デフォルト監視トークID",
						description: 'HTMLのid属性のうち、"talk-_"で始まるものを半角カンマ区切りで入力してください。',
						type: FormTypes.TEXT_ARRAY,
						defaultValue: [],
						parentKey: "watch_default_observe_talk"
					}
				}
			},
			{
				key: "log-settings",
				name: "ログ",
				description: "ログの表示形式をカスタマイズします。",
				items: {
					log_label: {
						key: "log_label",
						name: "ログラベル",
						description: "コンソールでのフィルター用の文字列です。",
						type: FormTypes.TEXT,
						defaultValue: ""
					},
					user_name_system: {
						type: FormTypes.TEXT,
						name: "システムユーザー名",
						key: "user_name_system",
						defaultValue: "システム"
					},
					log_stamp: {
						key: "log_stamp",
						name: "スタンプログ",
						type: FormTypes.TEXT,
						defaultValue: "[スタンプ]"
					},
					log_image: {
						key: "log_image",
						name: "画像ログ",
						type: FormTypes.TEXT,
						defaultValue: "[画像]"
					},
					log_file: {
						key: "log_file",
						name: "ファイルログ",
						type: FormTypes.TEXT,
						defaultValue: "[ファイル]"
					},
					date_format: {
						key: "date_format",
						name: "日付フォーマット",
						description: "パターン文字で指定してください。 例：yyyy/M/d(e) HH:mm:ss",
						type: FormTypes.TEXT,
						defaultValue: "yyyy/M/d(e) HH:mm:ss"
					},
					custom_log_start_observe_messages: {
						key: "custom_log_start_observe_messages",
						name: "メッセージ監視開始文",
						description: "&lt;time&gt;:監視開始日時",
						type: FormTypes.TEXT,
						defaultValue: "<time> メッセージの監視を開始します。"
					},
					custom_log_start_observe_talk: {
						key: "custom_log_start_observe_talk",
						name: "トーク監視開始文",
						description: "&lt;talkId&gt;:トークID, &lt;talkName&gt;:トーク名, &lt;time&gt;:監視開始日時",
						type: FormTypes.TEXT,
						defaultValue: "<time> [<talkName>]の監視を開始します。"
					},
					custom_log_message_header: {
						key: "custom_log_message_header",
						name: "メッセージヘッダー",
						description: "&lt;talkId&gt;:トークID, &lt;talkName&gt;:トーク名, &lt;time&gt;:発言日時, &lt;userName&gt;:ユーザー名",
						type: FormTypes.TEXT,
						defaultValue: "<time> [<talkName>] <userName>"
					}
				}
			}
		]
	};

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
		SETTING_DATA.sections.forEach(section => {
			Iterator.of(section.items)
				.filter(key => settings[key] === undefined)
				.forEach((key, inputData) => settings[key] = inputData.defaultValue);
		});

		setSettings(settings);
	}

	/**
    * 設定画面を描画します。
    */
	function drawSettingView(){
		const settingPage = document.getElementById("environment-page");

		const hr = createElement(ElementTypes.HR);
		settingPage.appendChild(hr);

		const pageTitle = createElement(ElementTypes.H3, {
			class: "page-title"
		});
		const pageTitleIcon = createElement(ElementTypes.SPAN, {
			class: "page-title-glyphicon glyphicon glyphicon-cog"
		});
		pageTitle.appendChild(pageTitleIcon);
		const pageTitleName = document.createTextNode(" " + SETTING_DATA.name);
		pageTitle.appendChild(pageTitleName);
		settingPage.appendChild(pageTitle);

		const description = createElementWithHTML(ElementTypes.DIV, SETTING_DATA.description);
		settingPage.appendChild(description);

		SETTING_DATA.sections.forEach(section => appendSettingSection(settingPage, section));
	}

	/**
    * 設定画面に項目を追加します。
    * @param {HTMLElement} settingPage 設定画面
    * @param {Object} settiongData 設定データ
    */
	function appendSettingSection(settingPage, settiongData){
		//設定項目の作成
		const inputKeyDatas = settiongData.items;
		const inputKeyForms = Iterator.of(inputKeyDatas).mapValue((key, data) => createSettingInputFormElement(data)).get();
		const section = createSettingSection(settiongData, Object.values(inputKeyForms));
		settingPage.appendChild(section);

		//フォームの初期値を設定
		const settings = getSettings();
		const inputKeyInputs = Iterator.of(inputKeyForms).mapValue(key => document.getElementById(HTML_ID_PREFIX + key)).get();
		Iterator.of(inputKeyInputs).forEach((key, input) => {
			const inputData = inputKeyDatas[key];
			const value = settings[key];
			switch(inputData.type){
				case FormTypes.TEXT:
				case FormTypes.TEXT_ARRAY:
				case FormTypes.NUMBER:
					input.value = value;
					break;
				case FormTypes.CHECKBOX:
					input.checked = value;
					break;
				case FormTypes.RADIOBUTTON:
					const button = document.getElementById(HTML_ID_PREFIX + value);
					button.checked = true;
					break;
			}

			//親が無効な場合、子の値を変更不可能化
			Optional.ofAbsentable(inputData.parentKey).ifPresent(parentKey => {
				const parentData = inputKeyDatas[parentKey];
				if(parentData.type == FormTypes.CHECKBOX){
					const parentInput = document.getElementById(HTML_ID_PREFIX + parentKey);
					const parentIsUnchecked = parentInput.checked === false;
					switch(inputData.type){
						case FormTypes.TEXT:
						case FormTypes.TEXT_ARRAY:
						case FormTypes.NUMBER:
						case FormTypes.CHECKBOX:
							input.disabled = parentIsUnchecked;
							break;
						case FormTypes.RADIOBUTTON:
							const buttons = input.querySelectorAll('input');
							buttons.forEach(button => button.disabled = parentIsUnchecked);
							break;
					}
				}
			});
		});

		//値変更時に変更ボタンをクリック可能化
		const changeButton = section.querySelector('.btn');
		const message = section.querySelector('.success');
		const onChangeValue = () => {
			const inputKeyInputValues = Iterator.of(inputKeyInputs).mapValue((key, input) => {
				const inputData = inputKeyDatas[key];
				switch(inputData.type){
					case FormTypes.TEXT:
					case FormTypes.TEXT_ARRAY:
					case FormTypes.NUMBER:
						return input.value;
					case FormTypes.CHECKBOX:
						return input.checked;
					case FormTypes.RADIOBUTTON:
						const buttons = document.getElementsByName(HTML_ID_PREFIX + key);
						const checkedButton = RadioButtons.of(buttons).findChecked();
						return checkedButton.id.replace(HTML_ID_PREFIX, "");
				}
			}).get();
			changeButton.disabled = equalsInputValuesToSettings(inputKeyInputValues, settings);
			setDisplay(message, DisplayTypes.NONE);
		};
		Iterator.of(inputKeyInputs).forEach((key, input) => {
			const inputData = inputKeyDatas[key];
			switch(inputData.type){
				case FormTypes.TEXT:
				case FormTypes.TEXT_ARRAY:
				case FormTypes.NUMBER:
					addEventListener(input, EventTypes.INPUT, onChangeValue);
					break;
				case FormTypes.CHECKBOX:
					addEventListener(input, EventTypes.CLICK, onChangeValue);
					break;
				case FormTypes.RADIOBUTTON:
					const buttons = document.getElementsByName(HTML_ID_PREFIX + key);
					buttons.forEach(button => addEventListener(button, EventTypes.CLICK, onChangeValue));
					break;
			}

			//親が無効な場合、子の値を変更不可能化
			Optional.ofAbsentable(inputData.parentKey).ifPresent(parentKey => {
				const parentData = inputKeyDatas[parentKey];
				if(parentData.type == FormTypes.CHECKBOX){
					const parentInput = document.getElementById(HTML_ID_PREFIX + parentKey);
					addEventListener(parentInput, EventTypes.CLICK, () => {
						const parentIsUnchecked = parentInput.checked === false;
						switch(inputData.type){
							case FormTypes.TEXT:
							case FormTypes.TEXT_ARRAY:
							case FormTypes.NUMBER:
							case FormTypes.CHECKBOX:
								input.disabled = parentIsUnchecked;
								break;
							case FormTypes.RADIOBUTTON:
								const buttons = input.querySelectorAll('input');
								buttons.forEach(button => button.disabled = parentIsUnchecked);
								break;
						}
					});
				}
			});
		});

		//変更ボタンクリック時に設定を更新
		addEventListener(changeButton, EventTypes.CLICK, () => {
			Iterator.of(inputKeyInputs).forEach((key, input) => {
				const inputData = inputKeyDatas[key];
				switch(inputData.type){
					case FormTypes.TEXT:
					case FormTypes.NUMBER:
						settings[key] = input.value;
						break;
					case FormTypes.TEXT_ARRAY:
						settings[key] = stringToArray(input.value);
						break;
					case FormTypes.CHECKBOX:
						settings[key] = input.checked;
						break;
					case FormTypes.RADIOBUTTON:
						const buttons = document.getElementsByName(HTML_ID_PREFIX + key);
						const checkedButton = RadioButtons.of(buttons).findChecked();
						settings[key] = checkedButton.id.replace(HTML_ID_PREFIX, "");
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
		if(inputData.type == FormTypes.TEXT || inputData.type == FormTypes.TEXT_ARRAY){
			const inputForm = createElement(ElementTypes.DIV, {
				class: "form-group"
			});
			const label = createElementWithHTML(ElementTypes.LABEL, inputData.name, {
				class: "control-label"
			});
			inputForm.appendChild(label);
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
			return inputForm;
		}else if(inputData.type == FormTypes.NUMBER){
			const inputForm = createElement(ElementTypes.DIV, {
				class: "form-group"
			});
			const label = createElementWithHTML(ElementTypes.LABEL, inputData.name, {
				class: "control-label"
			});
			inputForm.appendChild(label);
			const inputArea = createElement(ElementTypes.DIV, {
				class: "controls"
			});
			const input = createElement(ElementTypes.INPUT, {
				type: "number",
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
			return inputForm;
		}else if(inputData.type == FormTypes.CHECKBOX){
			const inputForm = createElement(ElementTypes.DIV, {
				class: "form-group"
			});
			const checkboxArea = createElement(ElementTypes.DIV, {
				class: "checkbox"
			});
			const label = createElement(ElementTypes.LABEL);
			const checkbox = createElement(ElementTypes.INPUT, {
				id: HTML_ID_PREFIX + inputData.key,
				type: "checkbox"
			});
			label.appendChild(checkbox);
			const labelText = document.createTextNode(inputData.name);
			label.appendChild(labelText);
			checkboxArea.appendChild(label);

			Optional.ofAbsentable(inputData.description).ifPresent(description => {
				const annotation = createElementWithHTML(ElementTypes.DIV, description, {
					class: "annotation"
				});
				checkboxArea.appendChild(annotation);
			});

			inputForm.appendChild(checkboxArea);
			return inputForm;
		}else if(inputData.type == FormTypes.RADIOBUTTON){
			const inputForm = createElement(ElementTypes.DIV, {
				class: "form-group",
				id: HTML_ID_PREFIX + inputData.key
			});
			const label = createElementWithHTML(ElementTypes.LABEL, inputData.name, {
				class: "control-label"
			});
			inputForm.appendChild(label);

			Optional.ofAbsentable(inputData.description).ifPresent(description => {
				const annotation = createElementWithHTML(ElementTypes.DIV, description, {
					class: "annotation"
				});
				inputForm.appendChild(annotation);
			});

			const buttons = inputData.buttons;
			buttons.forEach(button => {
				const radioButtonArea = createElement(ElementTypes.DIV, {
					class: "radio"
				});
				const label = createElement(ElementTypes.LABEL);
				const input = createElement(ElementTypes.INPUT, {
					type: "radio",
					name: HTML_ID_PREFIX + inputData.key,
					id: HTML_ID_PREFIX + button.key
				});
				label.appendChild(input);
				const labelText = document.createTextNode(button.name);
				label.appendChild(labelText);
				radioButtonArea.appendChild(label);

				Optional.ofAbsentable(button.description).ifPresent(description => {
					const annotation = createElementWithHTML(ElementTypes.DIV, description, {
						class: "annotation"
					});
					radioButtonArea.appendChild(annotation);
				});

				inputForm.appendChild(radioButtonArea);
			});
			return inputForm;
		}
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
		const header = createElementWithHTML(ElementTypes.DIV, settingData.name, {
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
	function equalsInputValuesToSettings(inputKeyInputValues, settings){
		return Iterator.of(inputKeyInputValues).every((key, inputValue) => {
			const settingValue = Array.isArray(settings[key]) ? arrayToString(settings[key]) : settings[key];
			return inputValue == settingValue;
		});
	}

	/**
	* サムネイル画像をぼかす機能を実行します。
	*/
	function doBlurThumbnail(){
		//トークエリアの追加を監視
		observeAddingTalkArea(talkArea => {
			//メッセージの追加を監視
			TalkArea.of(talkArea).observeAddingMessageArea(messageArea => {
				const messageAreaChild = messageArea.querySelector('div:first-child');
				const messageBodyArea = messageAreaChild.querySelector('.msg-body');
				const messageType = getMessageType(messageBodyArea.classList);
				if(messageType == MessageTypes.FILE || messageType == MessageTypes.FILE_AND_TEXT){
					const thumbnailArea = messageArea.querySelector('.msg-text-contained-thumb');
					const thumbnails = thumbnailArea.querySelectorAll('img');
					thumbnails.forEach(thumbnail => setStyle(thumbnail, "filter", "blur(" + settings.thumbnail_blur_grade + "px)"));
				}
			});
		});
	}

	/**
	* サムネイルサイズの変更機能を実行します。
	*/
	function doChangeThumbnailSize(){
		//トークエリアの追加を監視
		observeAddingTalkArea(talkArea => {
			//メッセージの追加を監視
			TalkArea.of(talkArea).observeAddingMessageArea(messageArea => {
				const messageAreaChild = messageArea.querySelector('div:first-child');
				const messageBodyArea = messageAreaChild.querySelector('.msg-body');
				const messageType = getMessageType(messageBodyArea.classList);
				if(messageType == MessageTypes.FILE || messageType == MessageTypes.FILE_AND_TEXT){
					const thumbnailArea = messageArea.querySelector('.msg-text-contained-thumb');
					setStyle(thumbnailArea, "width", settings.thumbnail_size + "px");
				}
			});
		});
	}

	/**
    * 送信ボタンの確認機能を実行します。
    */
	function doConfirmSendMessageButton(){
		const sendForms = document.querySelectorAll('.form-send');
		sendForms.forEach(sendForm => {
			const textArea = sendForm.querySelector('.form-send-text');
			const sendButtonArea = sendForm.querySelector('.form-send-button-group');
			const sendButton = sendForm.querySelector('.form-send-button');

			//ダミー送信ボタンを作成
			const dummySendButton = deepCloneNode(sendButton);
			dummySendButton.disabled = true;
			sendButtonArea.appendChild(dummySendButton);

			//送信ボタンを非表示化
			setDisplay(sendButton, DisplayTypes.NONE);

			//文字入力時にダミー送信ボタンをクリック可能化
			addEventListener(textArea, EventTypes.INPUT, () => dummySendButton.disabled = textArea.value === "");

			//添付ファイル追加時にダミー送信ボタンをクリック可能化
			const fileArea = sendForm.querySelector('.staged-files');
			Observer.of(fileArea).attributes("style").hasChanged(mutations => {
				mutations.forEach(mutation => {
					const display = fileArea.style.display;
					dummySendButton.disabled = display == "none";
				});
			}).start();

			//ダミー送信ボタンクリック時に確認ダイアログを表示
			addEventListener(dummySendButton, EventTypes.CLICK, () => {
				if(window.confirm("本当に送信しますか？")){
					//送信ボタンをクリック
					sendButton.click();
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

		const userDialog = document.getElementById("user-dialog-basic-profile");
		const icon = userDialog.querySelector('.prof-icon-large');
		setStyle(icon, "cursor", "zoom-in");

		//アイコンクリック時に拡大画像を表示
		addEventListener(icon, EventTypes.CLICK, () => {
			const image = icon.querySelector('img');
			const backgroundImage = image.style["background-image"];
			const url = backgroundImage.match(/url\("(.+)"\)/)[1];

			//モーダルで背景を暗くする
			const modal = document.querySelector('.modal-backdrop');
			const modalZIndex = modal.style["z-index"];
			setStyle(modal, "z-index", CUSTOM_MODAL_Z_INDEX);

			//拡大画像エリアを作成
			const expandedImageArea = createElement(ElementTypes.DIV, {
				id: HTML_ID_PREFIX + "expanded-user-icon"
			}, {
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
			const expandedImage = createElement(ElementTypes.IMG, {
				src: url
			}, {
				"max-width": "100%",
				"max-height": "100%"
			});
			expandedImageArea.appendChild(expandedImage);
			document.body.appendChild(expandedImageArea);

			const addKeyupListener = listener => addEventListener(document, EventTypes.KEYUP, listener);
			const removeKeyupListener = listener => removeEventListener(document, EventTypes.KEYUP, listener);

			const closeExpandedImage = () => {
				document.body.removeChild(expandedImageArea);
				setStyle(modal, "z-index", modalZIndex);
			};

			const onEscapeKeyup = event => {
				if(event.key == KeyTypes.ESCAPE.key){
					closeExpandedImage();
					removeKeyupListener(onEscapeKeyup);
				}
			};

			//拡大画像エリアクリック時に拡大画像を閉じる
			addEventListener(expandedImageArea, EventTypes.CLICK, event => {
				closeExpandedImage();
				removeKeyupListener(onEscapeKeyup);

				//拡大画像エリアクリック後にEscapeキー押下時にユーザーダイアログを閉じる
				addKeyupListener(event => {
					if(event.key == KeyTypes.ESCAPE.key){
						const userModal = document.getElementById("user-modal");
						userModal.click();
					}
				});
			});

			//Escapeキー押下時に拡大画像エリアを閉じる
			addKeyupListener(onEscapeKeyup);
		});
	}

	/**
    * マルチビューのレスポンシブ化機能を実行します。
    */
	function doResponsiveMultiView(){
		const multiPane = document.getElementById("talk-panes-multi");
		const talkPanes = multiPane.querySelectorAll('.talk-pane');
		talkPanes.forEach(talkPane => {
			//トークペインのclass属性変更時、表示を切り替え
			Observer.of(talkPane).attributes("class").hasChanged(mutations => {
				mutations.forEach(mutation => {
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
						const talkPane = talkPanes[0];
						setDisplay(talkPane, DisplayTypes.BLOCK);
						const emptyView = talkPane.querySelector('.empty-view-container-for-timeline');
						emptyView.classList.remove("hide");
						const timelineHeader = talkPane.querySelector('.timeline-header');
						timelineHeader.style["background-color"] = "#ffffff";
					}else{
						const talkPane = talkPanes[0];
						const timelineHeader = talkPane.querySelector('.timeline-header');
						const talkPaneColor = talkPane.querySelector('.dropdown-toggle').style["background-color"];
						timelineHeader.style["background-color"] = talkPaneColor;
					}
				});
			}).start();
		});
	}

	/**
    * 入力文字数の表示機能を実行します。
    */
	function doShowMessageCount(){
		$('.form-send').each((i, form) => {
			const $textArea = $(form).find('.form-send-text');
			const maxLength = $textArea.prop("maxLength");

			//カウンターを作成
			const $counter = $(`<label id="${HTML_ID_PREFIX + "message-count"}" style="margin-right:8px">${maxLength}</label>`);
			$(form).find('.form-send-button-group').prepend($counter);

			//文字入力時にカウンターの値を更新
            $textArea.on("input", () => $counter.html(maxLength - $textArea.val().length));
		});
	}

	/**
    * メッセージの監視機能を実行します。
    */
	function doWatchMessage(){
		const talkIdTalks = {};
		const observingTalkIds = [];

		//トーク一覧に子ノード追加時、トーク関連処理を実行
		const talks = document.getElementById("talks");
		Observer.of(talks).childList().hasChanged(mutations => {
			//デフォルト監視対象を監視対象に追加
			if(settings.watch_default_observe_talk === true){
				//既読デフォルト監視トークIDリストの作成
				const readTalkIds = settings.default_observe_talk_ids.filter(talkId => {
					const talk = document.getElementById(talkId);
					return Optional.ofAbsentable(talk.querySelector('.corner-badge')).isAbsent();
				});

				//既読デフォルト監視トークを監視対象に追加
				readTalkIds.filter(talkId => !observingTalkIds.includes(talkId)).forEach((talkId, index) => {
					const talk = document.getElementById(talkId);
					//監視対象に追加するためにクリック
					talk.click();
					observingTalkIds.push(talkId);

					//最後の場合はトークを閉じるために2回クリック
					if(index == readTalkIds.length -1){
						talk.click();
					}
				});
			}

			//トーク情報の更新
			mutations.forEach(mutation => {
				const talkItems = mutation.addedNodes;
				talkItems.forEach(talkItem => {
					const talkId = talkItem.id;
					const talkName = talkItem.querySelector('.talk-name-part').textContent;
					const talk = new Talk(talkId, talkName);
					const talkIsRead = talkItem.querySelector('.corner-badge') === null;
					talk.isRead = talkIsRead;
					talkIdTalks[talkId] = talk;
				});
			});
		}).start();

		//メッセージ監視開始ログを表示
		const observeStartMessage = Replacer.of(
				[/<time>/g, formatDate(new Date(), settings.date_format)]
			).exec(settings.custom_log_start_observe_messages);
		console.info(settings.log_label, observeStartMessage);

		//トークエリアの追加を監視
		observeAddingTalkArea(talkArea => {
			//トークを生成
			const talkId = talkArea.id.replace(/(multi\d?-)?msgs/, "talk");
			const talk = talkIdTalks[talkId];

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
				const message = createMessage(messageArea, talk);

				//メッセージをコンソールに出力
				if(message.time > observeStartDate || settings.show_past_message === true){
					logMessage(message);
				}
			});
		});
	}

	/**
    * トークエリアの追加を監視します。
    * @param {Function} callback : talkArea => {...}
    */
	function observeAddingTalkArea(callback){
		//メッセージエリアに子ノード追加時、トークエリア関連処理を実行
		const messagesArea = document.getElementById("messages");
		Observer.of(messagesArea).childList().hasChanged(mutations => {
			mutations.forEach(mutation => {
				const talkAreas = mutation.addedNodes;
				talkAreas.forEach(talkArea => callback(talkArea));
			});
		}).start();
	}

	/**
    * メッセージを作成します。
    * @param {Node} messageArea メッセージエリア
    * @parma {Talk} talk トーク
    * @return {Message} メッセージ
    */
	function createMessage(messageArea, talk){
		const messageAreaChild = messageArea.querySelector('div:first-child');
		const messageBodyArea = messageAreaChild.querySelector('.msg-body');
		const messageType = getMessageType(messageBodyArea.classList);

		const message = new Message(talk);
		message.time = getMessageTime(messageArea);
		message.userName = getMessageUserName(messageAreaChild);
		message.body = getMessageBody(messageBodyArea, messageType);

		if(messageType == MessageTypes.STAMP){
			message.stamp = getMessageStamp(messageBodyArea);
		}

		return message;
	}

	/**
    * メッセージ種別を取得します。
    * メッセージ種別が存在しないまたは複数ある場合はundefinedを返します。
    * @param {DOMTokenList} classList クラスリスト
    * @return {MessageType} メッセージ種別
    */
	function getMessageType(classList){
		const messageTypes = Object.values(MessageTypes).filter(messageType => classList.contains(messageType.value));
		return messageTypes.length == 1 ? messageTypes[0] : undefined;
	}

	/**
    * ファイル種別を取得します。
    * ファイル種別が存在しないまたは複数ある場合はundefinedを返します。
    * @param {DOMTokenList} classList クラスリスト
    * @return {FileType} ファイル種別
    */
	function getFileType(classList){
		const fileTypes = Object.values(FileTypes).filter(fileType => classList.contains(fileType.value));
		return fileTypes.length == 1 ? fileTypes[0] : undefined;
	}

	/**
    * スタンプ種別を取得します。
    * スタンプ種別が存在しないまたは複数ある場合はundefinedを返します。
    * @param {DOMTokenList} classList クラスリスト
    * @return {StampType} スタンプ種別
    */
	function getStampType(classList){
		const stampTypes = Object.values(StampTypes).filter(stampType => classList.contains(stampType.value));
		return stampTypes.length == 1 ? stampTypes[0] : undefined;
	}

	/**
    * メッセージの投稿日時を取得します。
    * @param {Node} messageArea メッセージエリア
    * @return {Date} メッセージの投稿日時
    */
	function getMessageTime(messageArea){
		const createdTimestamp = Number(messageArea.getAttribute("data-created-at"));
		return new Date(createdTimestamp);
	}

	/**
    * メッセージのユーザー名を取得します。
    * @param {Node} messageAreaChild メッセージエリア子要素
    * @return {String} メッセージのユーザー名
    */
	function getMessageUserName(messageAreaChild){
		const userTypeValue = messageAreaChild.className;
		switch(userTypeValue){
			case UserTypes.SYSTEM.value:
				return settings.user_name_system;
			case UserTypes.ME.value:
				const myUserName = document.getElementById("current-username");
				return removeBlank(myUserName.textContent);
			case UserTypes.OTHERS.value:
				const otherUserName = messageAreaChild.querySelector('.username');
				return removeBlank(otherUserName.textContent);
		}
	}

	/**
    * メッセージの本文を取得します。
    * @param {Node} messageBodyArea メッセージ本文エリア
    * @param {MessageType} messageType メッセージ種別
    * @return {String} メッセージの本文
    * @throws {TypeError} messageTypeの型がMessageTypeではない場合
    */
	function getMessageBody(messageBodyArea, messageType){
		if(!(messageType instanceof MessageType)){
			throw new TypeError(messageType + " is not instance of MessageType");
		}

		if(messageType == MessageTypes.FILE || messageType == MessageTypes.FILE_AND_TEXT){
			const fileType = getFileType(messageBodyArea.querySelector('.msg-thumb').classList);
			const prefix = fileType == FileTypes.IMAGE ? settings.log_image : settings.log_file;
			if(messageType == MessageTypes.FILE_AND_TEXT && !messageBodyArea.classList.contains("no-text")){
				return prefix + messageBodyArea.querySelector('.msg-thumbs-text').textContent;
			}else{
				return prefix;
			}
		}else if(messageType == MessageTypes.STAMP){
			const stampType = getStampType(messageBodyArea.classList);
			if(stampType == StampTypes.NO_TEXT){
				return settings.log_stamp;
			}
		}

		//本文テキストのみを取得するために深く複製したノードからメッセージメニューを削除
		const messageText = deepCloneNode(messageBodyArea.querySelector('.msg-text'));
		const messageMenu = messageText.querySelector('.msg-menu-container');
		Optional.ofAbsentable(messageMenu).ifPresent(messageMenu => messageText.removeChild(messageMenu));
		return messageText.textContent;
	}

	/**
    * メッセージのスタンプを取得します。
    * @param {Node} messageBodyArea メッセージ本文エリア
    * @return {Node} メッセージのスタンプ
    */
	function getMessageStamp(messageBodyArea){
		return messageBodyArea.querySelector('img');
	}

	/**
    * メッセージをコンソールに出力します。
    * @param {Message} message メッセージ
    * @throws {TypeError} messageの型がMessageではない場合
    */
	function logMessage(message){
		if(!(message instanceof Message)){
			throw new TypeError(message + " is not instance of Message");
		}

		const header = Replacer.of(
			[/<talkId>/g, message.talk.id],
			[/<time>/g, formatDate(message.time, settings.date_format)],
			[/<talkName>/g, message.talk.name],
			[/<userName>/g, message.userName]
		).exec(settings.custom_log_message_header);

		console.group(header);
		Optional.ofAbsentable(message.stamp)
			.ifPresent(stamp => console.log(settings.log_label, message.body, stamp))
			.ifAbsent(() => console.log(settings.log_label, message.body));
		console.groupEnd();
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
    * ノードの深い複製を返します。
    * @param {Node} node ノード
    * @return {Node} ノードの深い複製
    */
	function deepCloneNode(node){
		return node.cloneNode(true);
	}

	/**
    * 内部テキストを持ったHTML要素を作成します。属性やスタイルがあれば設定します。
    * @param {ElementType} elementType 要素種別
    * @param {Object} [attributes] 属性
    * @param {Object} [styles] スタイル
    * @param {String} text テキスト
    * @return {HTMLElement} HTML要素
    * @throws {TypeError} elementTypeの型がElementTypeではない場合
    */
	function createElementWithText(elementType, text, attributes, styles){
		const element = createElement(elementType, attributes, styles);
		element.textContent = text;
		return element;
	}

	/**
    * 内部HTMLを持ったHTML要素を作成します。属性やスタイルがあれば設定します。
    * @param {ElementType} elementType 要素種別
    * @param {Object} [attributes] 属性
    * @param {Object} [styles] スタイル
    * @param {String} html HTML
    * @return {HTMLElement} HTML要素
    * @throws {TypeError} elementTypeの型がElementTypeではない場合
    */
	function createElementWithHTML(elementType, html, attributes, styles){
		const element = createElement(elementType, attributes, styles);
		element.innerHTML = html;
		return element;
	}

	/**
    * HTML要素を作成します。属性やスタイルがあれば設定します。
    * @param {ElementType} elementType 要素種別
    * @param {Object} [attributes] 属性
    * @param {Object} [styles] スタイル
    * @return {HTMLElement} HTML要素
    * @throws {TypeError} elementTypeの型がElementTypeではない場合
    */
	function createElement(elementType, attributes, styles){
		if(!(elementType instanceof ElementType)){
			throw new TypeError(elementType + " is not instance of ElementType");
		}
		const element = document.createElement(elementType.value);
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
    * @param {DisplayType} displayType ディスプレイ種別
    * @throws {TypeError} displayTypeの型がDisplayTypeではない場合
    */
	function setDisplay(element, displayType){
		if(!(displayType instanceof DisplayType)){
			throw new TypeError(displayType + " is not instance of DisplayType");
		}
		setStyle(element, "display", displayType.value);
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
    * @param {EventType} eventType イベント種別
    * @param {Function} listener : Event => {}
    * @throws {TypeError} eventTypeの型がEventTypeではない場合
    */
	function addEventListener(element, eventType, listener){
		if(!(eventType instanceof EventType)){
			throw new TypeError(eventType + " is not instance of EventType");
		}
		element.addEventListener(eventType.value, listener, false);
	}

	/**
    * HTML要素からイベントリスナーを削除します。
    * @param {HTMLElement} element HTML要素
    * @param {EventType} eventType イベント種別
    * @param {Function} listener : Event => {}
    * @throws {TypeError} eventTypeの型がEventTypeではない場合
    */
	function removeEventListener(element, eventType, listener){
		if(!(eventType instanceof EventType)){
			throw new TypeError(eventType + " is not instance of EventType");
		}
		element.removeEventListener(eventType.value, listener, false);
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