
const CONFIRM_MESSAGE = '本当に送信しますか？';

/**
* 送信ボタンの確認機能を実行します。
*/
function doConfirmSendMessageButton(){
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
          const fileAreaIsHidden = $(fileArea).is(':hidden');
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

export default doConfirmSendMessageButton;
