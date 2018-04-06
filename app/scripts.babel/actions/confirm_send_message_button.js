const CONFIRM_MESSAGE = '本当に送信しますか？';

export default function(){
  const $sendForms = $('.form-send');
  $sendForms.each((i, sendForm) => {
    const $sendButton = $(sendForm).find('.form-send-button');

    //ダミー送信ボタンを作成
    const $dummySendButton = $sendButton.clone().prop('disabled', true);
    const $sendButtonGroup = $(sendForm).find('.form-send-button-group');
    $sendButtonGroup.append($dummySendButton);

    //送信ボタンを非表示化
    $sendButton.hide();

    //文字入力時にダミー送信ボタンをクリック可能化
    const $textArea = $(sendForm).find('.form-send-text');
    $textArea.on('input', () => {
      $dummySendButton.prop('disabled', $textArea.val() === '');
    });

    //添付ファイル追加時にダミー送信ボタンをクリック可能化
    const $fileAreas = $(sendForm).find('.staged-files');
    $fileAreas.each((i, fileArea) => {
      Observer.of(fileArea).attributes('style').hasChanged(() => {
        $dummySendButton.prop('disabled', $(fileArea).is(':hidden'));
      }).start();
    });

    //ダミー送信ボタンクリック時に確認ダイアログを表示
    $dummySendButton.on('click', () => {
      if(window.confirm(CONFIRM_MESSAGE)){
        $sendButton.click();
      }else{
        //なにもしない
      }
    });
  });
}
