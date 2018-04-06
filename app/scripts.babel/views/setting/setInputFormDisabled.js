import FormTypes from '@enums/FormTypes';

/**
* 入力フォーム要素のdisabled属性を設定します。
* @param {jQuery} $input 入力フォーム要素
* @param {FormType} formType フォーム種別
* @param {Boolean} disabled disabled属性の値
*/
export default function($input, formType, disabled){
  switch(formType){
    case FormTypes.TEXT:
    case FormTypes.TEXT_ARRAY:
    case FormTypes.NUMBER:
    case FormTypes.CHECKBOX:
      $input.prop('disabled', disabled);
      break;
    case FormTypes.RADIOBUTTON:
      const $buttons = $input.find('input');
      $buttons.each((i, button) => $(button).prop('disabled', disabled));
      break;
  }
}
