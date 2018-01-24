import KeyTypes from '@enums/KeyTypes';

const CUSTOM_MODAL_Z_INDEX = 9999;

export default function(){
  const $icon = $('#user-dialog-basic-profile .prof-icon-large');

  //アイコンのマウスカーソルを変更
  $icon.css('cursor', 'zoom-in');

  //アイコンクリック時に拡大画像を表示
  $icon.on('click', () => {
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
    $('body').append($expandedImageArea);

    //拡大画像を作成
    const $iconImage = $icon.find('img');
    const imageURL = $iconImage.css('background-image').match(/url\("(.+)"\)/)[1];
    const $expandedImage = $(`<img src="${imageURL}">`).css({
      'max-width': '100%',
      'max-height': '100%'
    });
    $expandedImageArea.append($expandedImage);

    const closeExpandedImage = () => {
      $expandedImageArea.remove();
      $modal.css('z-index', modalZIndex);
    };

    //Escapeキー押下時に拡大画像エリアを閉じる
    $(document).on('keyup', event => {
      if(event.key == KeyTypes.ESCAPE.key){
        closeExpandedImage();
        $(document).off('keyup');
      }
    });

    //拡大画像エリアクリック時に拡大画像を閉じる
    $expandedImageArea.on('click', () => {
      closeExpandedImage();
      $(document).off('keyup');

      //拡大画像エリアクリック後にEscapeキー押下時にユーザーダイアログを閉じる
      $(document).on('keyup', event => {
        if(event.key == KeyTypes.ESCAPE.key){
          $('#user-modal').click();
          $(document).off('keyup');
        }
      });
    });
  });
}
