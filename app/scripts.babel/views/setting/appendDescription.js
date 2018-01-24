const STYLE = {
  'font-size': 'small',
  'color': '#999'
};

/**
* 要素に説明を追加します。
* @param {jQuery} $element 要素
* @param {String} description 説明
*/
export default function($element, description){
  const $description = $(`<div class="annotation">${description}</div>`).css(STYLE);
  $element.append($description);
}
