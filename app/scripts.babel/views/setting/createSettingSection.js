import createSettingFormGroup from '@views/setting/createSettingFormGroup';

const HTML_ID_PREFIX = 'direct_helper-';

/**
* 設定セクション要素を作成します。
* @param {Object} section 設定セクション
* @param {SuperMap} settingItemMap 設定アイテムマップ
* @return {jQuery} 設定セクション要素
*/
export default function(section, settingItemMap){
  const id = HTML_ID_PREFIX + section.key;
  const $section = $(`<div class="c-section" id="${id}"></div>`);
  $section.append(`<div class="c-section__heading">${section.name}</div>`);
  Optional.ofAbsentable(section.description).ifPresent(description => $section.append(`<div class="form-group">${description}</div>`));
  const formGroupMap = settingItemMap.mapValue(item => createSettingFormGroup(item));
  formGroupMap.forEach($formGroup => $section.append($formGroup));
  const $buttonArea = $('<div></div>');
  $buttonArea.append('<button type="button" class="btn btn-primary btn-fix" disabled>変更</button>');
  $buttonArea.append('<span class="success" style="display:none">変更しました。</span>');
  $section.append($buttonArea);
  return $section;
}
