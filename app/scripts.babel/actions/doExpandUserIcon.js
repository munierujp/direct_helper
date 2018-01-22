const CUSTOM_MODAL_Z_INDEX = 9999;

/**
* ユーザーアイコンの拡大機能を実行します。
*/
function doExpandUserIcon(){
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

export default doExpandUserIcon;
