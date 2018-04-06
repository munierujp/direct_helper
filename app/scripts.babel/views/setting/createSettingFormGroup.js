import FormTypes from '@enums/FormTypes';
import appendDescription from '@views/setting/appendDescription';
import appendExperimentMessage from '@views/setting/appendExperimentMessage';

const HTML_ID_PREFIX = 'direct_helper-';

/**
* フォームグループ要素を作成します。
* @param {Object} item 設定アイテム
* @return {jQuery} フォームグループ要素
*/
export default function(item){
  if(item.type == FormTypes.TEXT || item.type == FormTypes.TEXT_ARRAY){
    const $formGroup = $('<div class="form-group"></div>');
    if(item.experiment){
      appendExperimentMessage($formGroup);
    }
    $formGroup.append(`<label class="control-label">${item.name}</label>`);
    const id = HTML_ID_PREFIX + item.key;
    $formGroup.append(`<div class="controls"><input id="${id}" class="form-control" name="status"></div>`);
    Optional.ofAbsentable(item.description).ifPresent(description => appendDescription($formGroup, description));
    return $formGroup;
  }else if(item.type == FormTypes.NUMBER){
    const $formGroup = $('<div class="form-group"></div>');
    if(item.experiment){
      appendExperimentMessage($formGroup);
    }
    $formGroup.append(`<label class="control-label">${item.name}</label>`);
    const id = HTML_ID_PREFIX + item.key;
    $formGroup.append(`<div class="controls"><input type="number" id="${id}" class="form-control" name="status"></div>`);
    Optional.ofAbsentable(item.description).ifPresent(description => appendDescription($formGroup, description));
    return $formGroup;
  }else if(item.type == FormTypes.CHECKBOX){
    const $formGroup = $('<div class="form-group"></div>');
    if(item.experiment){
      appendExperimentMessage($formGroup);
    }
    const $checkboxArea = $('<div class="checkbox"></div>');
    const id = HTML_ID_PREFIX + item.key;
    $checkboxArea.append(`<label><input id="${id}" type="checkbox">${item.name}</label>`);
    Optional.ofAbsentable(item.description).ifPresent(description => appendDescription($checkboxArea, description));
    $formGroup.append($checkboxArea);
    return $formGroup;
  }else if(item.type == FormTypes.RADIOBUTTON){
    const id = HTML_ID_PREFIX + item.key;
    const $formGroup = $(`<div class="form-group" id="${id}"></div>`);
    if(item.experiment){
      appendExperimentMessage($formGroup);
    }
    $formGroup.append(`<label class="control-label">${item.name}</label>`);
    Optional.ofAbsentable(item.description).ifPresent(description => appendDescription($formGroup, description));
    item.buttons.forEach(button => {
      const $radioButtonArea = $('<div class="radio"></div>');
      const name = HTML_ID_PREFIX + item.key;
      const id = name + '_' + button.key;
      $radioButtonArea.append(`<label><input type="radio" name="${name}" id="${id}">${button.name}</label>`);
      Optional.ofAbsentable(button.description).ifPresent(description => appendDescription($formGroup, description));
      $formGroup.append($radioButtonArea);
    });
    return $formGroup;
  }
}
