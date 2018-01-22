import 'babel-polyfill';

import fetchSettings from '@functions/fetchSettings';
import setSettings from '@functions/setSettings';
import arrayToString from '@functions/arrayToString';
import stringToArray from '@functions/stringToArray';
import FormTypes from '@enums/FormTypes';
import settingData from '@constants/settingData';
import actions from '@constants/actions';

(function(){
  'use strict';

  /** id属性接頭辞 */
  const HTML_ID_PREFIX = 'direct_helper-';

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

    Object.keys(actions)
      .filter(key => settings[key] === true)
      .map(key => actions[key])
      .forEach(action => action());
  }
})();
