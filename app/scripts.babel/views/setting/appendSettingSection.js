import createSettingSection from '@views/setting/createSettingSection';
import setInputFormDisabled from '@views/setting/setInputFormDisabled';
import fetchSettings from '@functions/fetchSettings';
import setSettings from '@functions/setSettings';
import arrayToSuperMap from '@functions/arrayToSuperMap';
import arrayToString from '@functions/arrayToString';
import stringToArray from '@functions/stringToArray';
import FormTypes from '@enums/FormTypes';

const HTML_ID_PREFIX = 'direct_helper-';

/**
* 設定ページに設定セクションを追加します。
* @param {jQuery} $settingPage 設定ページ要素
* @param {Object} section 設定セクション
* @param {Object} settings 設定
*/
export default async function($settingPage, section, settings){
  const settingItemMap = arrayToSuperMap(section.items).mapKey((item, key) => item.key);

  const $section = createSettingSection(section, settingItemMap);
  $settingPage.append($section);

  const inputMap = settingItemMap
    .mapValue(($formGroup, key) => HTML_ID_PREFIX + key)
    .mapValue(id => $settingPage.find(`#${id}`));

  //入力フォームの値を初期化
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
        const $parentInput = inputMap.get(parentKey);
        const parentIsUnchecked = $parentInput.prop('checked') === false;
        setInputFormDisabled($input, item.type, parentIsUnchecked);
      }
    });
  });

  const $changeButton = $section.find('.btn');
  const $changeMessage = $section.find('.success');

  const onChangeValue = async() => {
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
          const $checkedButton = $buttons.filter((i, button) => button.checked);
          const id = $checkedButton.prop('id');
          const buttonKey = id.replace(HTML_ID_PREFIX, '').replace(`${key}_`, '');
          return buttonKey;
      }
    });

    const settings = await fetchSettings();
    const valuesIsAllMatch = inputValueMap.toEntries().every(entry => {
      const key = entry[0];
      const inputValue = entry[1];
      const settingValue = Array.isArray(settings[key]) ? arrayToString(settings[key]) : settings[key];
      return inputValue == settingValue;
    });
    $changeButton.prop('disabled', valuesIsAllMatch);
    $changeMessage.hide();
  };

  //値変更時に変更ボタンをクリック可能化
  inputMap.forEach(($input, key) => {
    const item = settingItemMap.get(key);
    switch(item.type){
      case FormTypes.TEXT:
      case FormTypes.TEXT_ARRAY:
      case FormTypes.NUMBER:
        $input.on('input', onChangeValue);
        break;
      case FormTypes.CHECKBOX:
        $input.on('click', onChangeValue);
        break;
      case FormTypes.RADIOBUTTON:
        const $buttons =  $settingPage.find(`#${HTML_ID_PREFIX}${key}`);
        $buttons.each((i, button) => $(button).on('click', onChangeValue));
        break;
    }

    //親が無効な場合、子の値を変更不可能化
    Optional.ofAbsentable(item.parentKey).ifPresent(parentKey => {
      const parentItem = settingItemMap.get(parentKey);
      if(parentItem.type == FormTypes.CHECKBOX){
        const $parentInput =  $settingPage.find(`#${HTML_ID_PREFIX}${parentKey}`);
        $parentInput.on('click', () => {
          const parentIsUnchecked = $parentInput.prop('checked') === false;
          setInputFormDisabled($input, item.type, parentIsUnchecked);
        });
      }
    });
  });

  //変更ボタンクリック時に設定を更新
  $changeButton.on('click', async() => {
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
          const buttonKey = id.replace(HTML_ID_PREFIX, '').replace(`${key}_`, '');
          settings[key] = buttonKey;
          break;
      }
    });

    setSettings(settings);
    $changeButton.prop('disabled', true);
    $changeMessage.show();
  });
}
