import 'babel-polyfill';

import HasValue from '@classes/HasValue';
import Talk from '@classes/Talk';
import TalkArea from '@classes/TalkArea';
import MessageArea from '@classes/MessageArea';

import fetchSettings from '@functions/fetchSettings';
import setSettings from '@functions/setSettings';
import arrayToString from '@functions/arrayToString';
import stringToArray from '@functions/stringToArray';
import formatDate from '@functions/formatDate';
import observeAddingTalkArea from '@functions/observeAddingTalkArea';

import FileTypes from '@enums/FileTypes';
import FormTypes from '@enums/FormTypes';
import KeyTypes from '@enums/KeyTypes';
import MessageTypes from '@enums/MessageTypes';
import StampTypes from '@enums/StampTypes';
import UserTypes from '@enums/UserTypes';

import settingData from '@constants/settingData';

(function(){
  'use strict';

  /** id属性接頭辞 */
  const HTML_ID_PREFIX = 'direct_helper-';

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
  initializeSettings()
    .then(() => {
    //設定画面の描画
    drawSettingView();

    //各種機能の実行
    doActions();
  });

  /**
  * 設定を初期化します。
  */
  async function initializeSettings(){
    const settings = await fetchSettings();

    //未設定項目にデフォルト値を設定
    settingData.sections.forEach(section => {
      section.items.filter(item => settings[item.key] === undefined).forEach(item => settings[item.key] = item.default);
    });

    setSettings(settings);
  }

  /**
  * 設定画面を描画します。
  */
  function drawSettingView(){
    const CLASS_ACTIVE_ITEM = 'active';

    //右ナビゲーションバーに設定メニューを追加
    const $settingMenuItem = $('<li></li>').css('cursor', 'pointer');
    const settingLinkId = `navbar-menu-${HTML_ID_PREFIX}${settingData.key}`;
    const $settingMenuLink = $(`<a id="${settingLinkId}" class="navbar-menu" data-original-title="${settingData.name}"></a>`);
    const iconURL = chrome.runtime.getURL('images/icon_32.png');
    $settingMenuLink.append(`<span><img src="${iconURL}"></span>`);
    $settingMenuLink.append(`<span class="navbar-menu-text">${settingData.name}</span>`);
    $settingMenuItem.append($settingMenuLink);
    $('.navbar-right').append($settingMenuItem);

    //設定ページを追加
    const $environmentPage = $('#environment-page');
    const settingPageId = `${HTML_ID_PREFIX}${settingData.key}-page`;
    const $settingPage = $(`<div class="page" id="${settingPageId}"></div>`).css({
      'max-width': $environmentPage.css('max-width'),
      'margin-left': $environmentPage.css('margin-left'),
      'margin-right': $environmentPage.css('margin-right'),
      'height': $environmentPage.css('max-width'),
      'padding-bottom': $environmentPage.css('padding-bottom')
    });
    $settingPage.append(`<h3 class="page-title"><span class="page-title-glyphicon glyphicon glyphicon-cog"></span>  ${settingData.name}</h3>`);
    $settingPage.append(`<div>${settingData.description}</div>`);
    settingData.sections.forEach(section => appendSettingSection($settingPage, section));
    $settingPage.hide();
    $settingPage.insertAfter($environmentPage);

    const $menuItems = $('#navbar-menu li');
    const $pages = $('#wrap .page');

    //設定メニュークリック時にページ表示を切り替え
    $settingMenuItem.on('click.direct_helper_drawSettingView', () => {
      //表示中のページを非表示
      $menuItems.filter((i, menuItem) => $(menuItem).hasClass(CLASS_ACTIVE_ITEM)).each((i, menuItem) => $(menuItem).removeClass(CLASS_ACTIVE_ITEM));
      $pages.filter((i, page) => $(page).is(':visible')).each((i, page) => $(page).hide());

      //設定ページを表示
      $settingMenuItem.addClass(CLASS_ACTIVE_ITEM);
      $settingPage.show();
    });

    //左ナビゲーションバーのメニュークリック時にページ表示を切り替え
    $('.navbar-left > li').on('click.direct_helper_drawSettingView', event => {
      //設定ページを非表示
      $settingMenuItem.removeClass(CLASS_ACTIVE_ITEM);
      $settingPage.hide();

      //クリックしたページを表示
      const $menuItem = $(event.currentTarget);
      $menuItem.addClass(CLASS_ACTIVE_ITEM);
      const linkId = $menuItem.find('a').attr('id');
      const pageId = linkId.replace(/navbar-menu-(.+)/, '$1-page');
      const page = $(`#${pageId}`);
      page.show();
    });

    //他のページ表示時にページ表示を切り替え
    $pages.filter((i, page) => $(page).attr('id') !== settingPageId).each((i, page) => {
      Observer.of(page).attributes('style').hasChanged(records => {
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
  async function appendSettingSection($settingPage, section){
    const arrayToMap = array => {
      const map = SuperMap.empty();
      array.forEach((element, index) => map.set(index, element));
      return map;
    };

    //設定項目の作成
    const $section = $(`<div id="${HTML_ID_PREFIX + section.key}" class="c-section"><div class="c-section__heading">${section.name}</div></div>`);
    Optional.ofAbsentable(section.description).ifPresent(description => $section.append(`<div class="form-group">${description}</div>`));
    const settingItemMap = arrayToMap(section.items).mapKey((item, key) => item.key);
    const formGroupMap = settingItemMap.mapValue(item => createSettingFormGroup(item));
    formGroupMap.forEach($formGroup => $section.append($formGroup));
    $section.append('<div><button type="button" class="btn btn-primary btn-fix" disabled>変更</button><span class="success" style="display:none">変更しました。</span></div>');
    $settingPage.append($section);

    //フォームの初期値を設定
    const settings = await fetchSettings();
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
          $input.prop('checked', value);
          break;
        case FormTypes.RADIOBUTTON:
          const $button = $settingPage.find(`#${HTML_ID_PREFIX}${key}_${value}`);
          $button.prop('checked', true);
          break;
      }

      //親が無効な場合、子の値を変更不可能化
      Optional.ofAbsentable(item.parentKey).ifPresent(parentKey => {
        const parentItem = settingItemMap.get(parentKey);
        if(parentItem.type == FormTypes.CHECKBOX){
          const $parentInput = $settingPage.find(`#${HTML_ID_PREFIX}${parentKey}`);
          const parentIsUnchecked = $parentInput.prop('checked') === false;
          switch(item.type){
            case FormTypes.TEXT:
            case FormTypes.TEXT_ARRAY:
            case FormTypes.NUMBER:
            case FormTypes.CHECKBOX:
              $input.prop('disabled', parentIsUnchecked);
              break;
            case FormTypes.RADIOBUTTON:
              const $buttons = $input.find('input');
              $buttons.each((i, button) => $(button).prop('disabled', parentIsUnchecked));
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
            return $input.prop('checked');
          case FormTypes.RADIOBUTTON:
            const $buttons =  $settingPage.find(`[name="${HTML_ID_PREFIX}${key}"]`);
            const $checkedButton = $buttons.filter((i, button) => button.checked === true);
            const id = $checkedButton.prop('id');
            return id.replace(HTML_ID_PREFIX, '').replace(key + '_', '');
        }
      });

      const valuesIsAllMatch = Array.from(inputValueMap.entries()).every(entry => {
        const key = entry[0];
        const inputValue = entry[1];
        const settingValue = Array.isArray(settings[key]) ? arrayToString(settings[key]) : settings[key];
        return inputValue == settingValue;
      });
      $changeButton.prop('disabled', valuesIsAllMatch);
      $message.hide();
    };
    inputMap.forEach(($input, key) => {
      const item = settingItemMap.get(key);
      switch(item.type){
        case FormTypes.TEXT:
        case FormTypes.TEXT_ARRAY:
        case FormTypes.NUMBER:
          $input.on('input.direct_helper_appendSettingSection', onChangeValue);
          break;
        case FormTypes.CHECKBOX:
          $input.on('click.direct_helper_appendSettingSection', onChangeValue);
          break;
        case FormTypes.RADIOBUTTON:
          const $buttons =  $settingPage.find(`#${HTML_ID_PREFIX}${key}`);
          $buttons.each((i, button) => $(button).on('click.direct_helper_appendSettingSection', onChangeValue));
          break;
      }

      //親が無効な場合、子の値を変更不可能化
      Optional.ofAbsentable(item.parentKey).ifPresent(parentKey => {
        const parentItem = settingItemMap.get(parentKey);
        if(parentItem.type == FormTypes.CHECKBOX){
          const $parentInput =  $settingPage.find(`#${HTML_ID_PREFIX}${parentKey}`);
          $parentInput.on('click.direct_helper_appendSettingSection', () => {
            const parentIsUnchecked = $parentInput.prop('checked') === false;
            switch(item.type){
              case FormTypes.TEXT:
              case FormTypes.TEXT_ARRAY:
              case FormTypes.NUMBER:
              case FormTypes.CHECKBOX:
                $input.prop('disabled', parentIsUnchecked);
                break;
              case FormTypes.RADIOBUTTON:
                const $buttons = $input.find('input');
                $buttons.each((i, button) => $(button).prop('disabled', parentIsUnchecked));
                break;
            }
          });
        }
      });
    });

    //変更ボタンクリック時に設定を更新
    $changeButton.on('click.direct_helper_appendSettingSection', async() => {
      const settings = await fetchSettings();
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
            settings[key] = $input.prop('checked');
            break;
          case FormTypes.RADIOBUTTON:
            const $buttons = $input.find('input');
            const $checkedButton = $buttons.filter((i, button) => button.checked === true);
            const id = $checkedButton.prop('id');
            settings[key] = id.replace(HTML_ID_PREFIX, '').replace(key + '_', '');
            break;
        }
      });

      setSettings(settings);
      $changeButton.prop('disabled', true);
      $message.show();
    });
  }

  /**
  * 設定画面のフォームグループオブジェクトを作成します。
  * @param {Object} item 設定アイテム
  * @return {jQuery} フォームグループオブジェクト
  */
  function createSettingFormGroup(item){
    const addExperimentMessage = $formGroup => $formGroup.append('<div style="color:red"><span class="glyphicon glyphicon-flash"></span>これは実験機能です。</div>');

    if(item.type == FormTypes.TEXT || item.type == FormTypes.TEXT_ARRAY){
      const $formGroup = $('<div class="form-group"></div>');
      if(item.experiment){
        addExperimentMessage($formGroup);
      }
      $formGroup.append(`<label class="control-label">${item.name}</label>`);
      const id = HTML_ID_PREFIX + item.key;
      $formGroup.append(`<div class="controls"><input id="${id}" class="form-control" name="status"></div>`);
      Optional.ofAbsentable(item.description).ifPresent(description => $formGroup.append(`<div class="annotation">${description}</div>`));
      return $formGroup;
    }else if(item.type == FormTypes.NUMBER){
      const $formGroup = $('<div class="form-group"></div>');
      if(item.experiment){
        addExperimentMessage($formGroup);
      }
      $formGroup.append(`<label class="control-label">${item.name}</label>`);
      const id = HTML_ID_PREFIX + item.key;
      $formGroup.append(`<div class="controls"><input type="number" id="${id}" class="form-control" name="status"></div>`);
      Optional.ofAbsentable(item.description).ifPresent(description => $formGroup.append(`<div class="annotation">${description}</div>`));
      return $formGroup;
    }else if(item.type == FormTypes.CHECKBOX){
      const $formGroup = $('<div class="form-group"></div>');
      if(item.experiment){
        addExperimentMessage($formGroup);
      }
      const $checkboxArea = $('<div class="checkbox"></div>');
      const id = HTML_ID_PREFIX + item.key;
      $checkboxArea.append(`<label><input id="${id}" type="checkbox">${item.name}</label>`);
      Optional.ofAbsentable(item.description).ifPresent(description => $checkboxArea.append(`<div class="annotation">${description}</div>`));
      $formGroup.append($checkboxArea);
      return $formGroup;
    }else if(item.type == FormTypes.RADIOBUTTON){
      const id = HTML_ID_PREFIX + item.key;
      const $formGroup = $(`<div class="form-group" id="${id}"></div>`);
      if(item.experiment){
        addExperimentMessage($formGroup);
      }
      $formGroup.append(`<label class="control-label">${item.name}</label>`);
      Optional.ofAbsentable(item.description).ifPresent(description => $formGroup.append(`<div class="annotation">${description}</div>`));
      item.buttons.forEach(button => {
        const $radioButtonArea = $('<div class="radio"></div>');
        const name = HTML_ID_PREFIX + item.key;
        const id = HTML_ID_PREFIX + item.key + '_' + button.key;
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
  async function doActions(){
    const settings = await fetchSettings();

    Object.keys(SETTINGS_KEY_ACTIONS)
      .filter(key => settings[key] === true)
      .map(key => SETTINGS_KEY_ACTIONS[key])
      .forEach(action => action());
  }

  /**
	* サムネイル画像をぼかす機能を実行します。
	*/
  async function doBlurThumbnail(){
    const settings = await fetchSettings();

    //トークエリアの追加を監視
    observeAddingTalkArea(talkArea => {
      //メッセージの追加を監視
      TalkArea.of(talkArea).observeAddingMessageArea(messageArea => {
        const messageType = MessageArea.of(messageArea).messageType;
        const messageHasFile = messageType == MessageTypes.FILE || messageType == MessageTypes.FILE_AND_TEXT;
        if(messageHasFile){
          const $thumbnailArea = $(messageArea).find('.msg-text-contained-thumb');
          const $thumbnails = $thumbnailArea.find('img');
          $thumbnails.each((i, thumbnail) => $(thumbnail).css('filter', `blur(${settings.thumbnail_blur_grade}px)`));
        }
      });
    });
  }

  /**
	* サムネイルサイズの変更機能を実行します。
	*/
  async function doChangeThumbnailSize(){
    const settings = await fetchSettings();

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
    const CONFIRM_MESSAGE = '本当に送信しますか？';

    const $sendForms = $('.form-send');
    $sendForms.each((i, sendForm) => {
      const $sendButton = $(sendForm).find('.form-send-button');

      //ダミー送信ボタンを作成
      const $dummySendButton = $sendButton.clone();
      $dummySendButton.prop('disabled', true);
      const $sendButtonGroup = $(sendForm).find('.form-send-button-group');
      $sendButtonGroup.append($dummySendButton);

      //送信ボタンを非表示化
      $sendButton.hide();

      //文字入力時にダミー送信ボタンをクリック可能化
      const $textArea = $(sendForm).find('.form-send-text');
      $textArea.on('input.direct_helper_doConfirmSendMessageButton', () => {
        const textAreaIsEmpty = $textArea.val() === '';
        $dummySendButton.prop('disabled', textAreaIsEmpty);
      });

      //添付ファイル追加時にダミー送信ボタンをクリック可能化
      const $fileAreas = $(sendForm).find('.staged-files');
      $fileAreas.each((i, fileArea) => {
        Observer.of(fileArea).attributes('style').hasChanged(records => {
          records.forEach(record => {
            const fileAreaIsHidden= $(fileArea).is(':hidden');
            $dummySendButton.prop('disabled', fileAreaIsHidden);
          });
        }).start();
      });

      //ダミー送信ボタンクリック時に確認ダイアログを表示
      $dummySendButton.on('click.direct_helper_doConfirmSendMessageButton', () => {
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

    const addEscapeKeyupListener = listener => $(document).on('keyup.direct_helper_doExpandUserIcon_onEscapeKeyup', listener);
    const removeEscapeKeyupListener = () => $(document).off('keyup.direct_helper_doExpandUserIcon_onEscapeKeyup');

    const $userDialog = $('#user-dialog-basic-profile');
    const $icon = $userDialog.find('.prof-icon-large');

    //アイコンのマウスカーソルを変更
    $icon.css('cursor', 'zoom-in');

    //アイコンクリック時に拡大画像を表示
    $icon.on('click.direct_helper_doExpandUserIcon_onClickIcon',  () => {
      const $image = $icon.find('img');
      const backgroundImage = $image.css('background-image');
      const url = backgroundImage.match(/url\("(.+)"\)/)[1];

      //モーダルで背景を暗くする
      const $modal = $('.modal-backdrop');
      const modalZIndex = $modal.css('z-index');
      $modal.css('z-index', CUSTOM_MODAL_Z_INDEX);

      //拡大画像エリアを作成
      const $expandedImageArea = $('<div></div>').css({
        'position': 'fixed',
        'top': 0,
        'left': 0,
        'width': '100%',
        'height': '100%',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'z-index': CUSTOM_MODAL_Z_INDEX + 1,
        'cursor': 'zoom-out'
      });

      //拡大画像を作成
      const $expandedImage = $(`<img src="${url}">`).css({
        'max-width': '100%',
        'max-height': '100%'
      });
      $expandedImageArea.append($expandedImage);
      $('body').append($expandedImageArea);

      const closeExpandedImage = () => {
        $expandedImageArea.remove();
        $modal.css('z-index', modalZIndex);
      };

      //Escapeキー押下時に拡大画像エリアを閉じる
      addEscapeKeyupListener(event => {
        if(event.key == KeyTypes.ESCAPE.key){
          closeExpandedImage();
          removeEscapeKeyupListener();
        }
      });

      //拡大画像エリアクリック時に拡大画像を閉じる
      $expandedImageArea.on('click.direct_helper_doExpandUserIcon_onClickExpandedImageArea', () => {
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
    const firstTalkPaneColor = $firstTimelineHeader.css('background-color');

    $talkPanes.each((i, talkPane) => {
      //トークペインのclass属性変更時、表示を切り替え
      Observer.of(talkPane).attributes('class').hasChanged(records => {
        records.forEach(record => {
          const $activeTalkPanes = $talkPanes.filter((i, talkPane) => $(talkPane).hasClass('has-send-form'));
          const $inactiveTalkPanes = $talkPanes.filter((i, talkPane) => $(talkPane).hasClass('no-send-form'));

          //アクティブペインを外側から表示
          $activeTalkPanes.each((i, talkPane) => {
            $(talkPane).show();
            const $timelinebody = $(talkPane).find('.timeline-body');
            $timelinebody.show();
            const $timelineHeader = $(talkPane).find('.timeline-header');
            const $timelineFotter = $(talkPane).find('.timeline-footer');
            $timelinebody.height($(talkPane).prop('clientHeight') - $timelineHeader.prop('clientHeight') - $timelineFotter.prop('clientHeight'));
            $timelinebody.scrollTop($timelinebody.prop('scrollHeight'));
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
            $emptyView.removeClass('hide');
            $firstTimelineHeader.css('background-color', '#ffffff');
          }else{
            $firstTimelineHeader.css('background-color', firstTalkPaneColor);
          }
        });
      }).start();
    });
  }

  /**
  * 入力文字数の表示機能を実行します。
  */
  async function doShowMessageCount(){
    const settings = await fetchSettings();
    const countDown = settings.show_message_count_types== 'countdown';

    const sendForms = $('.form-send');
    sendForms.each((i, sendForm) => {
      const $textArea = $(sendForm).find('.form-send-text');
      const maxLength = $textArea.prop('maxLength');

      //カウンターを作成
      const count = countDown ? maxLength : 0;
      const $counter = $(`<label>${count}</label>`).css('margin-right', '8px');
      const $sendButtonGroup = $(sendForm).find('.form-send-button-group');
      $sendButtonGroup.prepend($counter);

      //文字入力時にカウンターの値を更新
      $textArea.on('input.direct_helper_doShowMessageCount', () => {
        const currentLength = $textArea.val().length;
        const count = countDown ? maxLength - currentLength : currentLength;
        $counter.text(count);
      });
    });
  }

  /**
  * メッセージの監視機能を実行します。
  */
  async function doWatchMessage(){
    const settings = await fetchSettings();

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
      const talkId = talkArea.id.replace(/(multi\d?-)?msgs/, 'talk');
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
})();
