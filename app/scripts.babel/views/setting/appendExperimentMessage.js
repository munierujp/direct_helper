const MESSAGE = 'これは実験機能です。バグを含むかもしれません。';

const STYLE = {
  'color': '#ff0000'
};

/**
* フォームグループに実験メッセージを追加します。
* @param {jQuery} $formGroup フォームグループ要素
*/
export default function($formGroup){
  const $message = $(`<div><span class="glyphicon glyphicon-flash"></span>${MESSAGE}</div>`).css(STYLE);
  $formGroup.append($message);
}
