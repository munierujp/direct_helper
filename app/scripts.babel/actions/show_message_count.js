import fetchSettings from '@functions/fetchSettings';

export default async function(){
  const settings = await fetchSettings();
  const countDown = settings.show_message_count_types == 'countdown';

  const $sendForms = $('.form-send');
  $sendForms.each((i, sendForm) => {
    const $textArea = $(sendForm).find('.form-send-text');
    const maxLength = $textArea.prop('maxLength');

    //カウンターを作成
    const count = countDown ? maxLength : 0;
    const $counter = $(`<label>${count}</label>`).css('margin-right', '8px');
    const $sendButtonGroup = $(sendForm).find('.form-send-button-group');
    $sendButtonGroup.prepend($counter);

    //文字入力時にカウンターの値を更新
    $textArea.on('input', () => {
      const currentLength = $textArea.val().length;
      const count = countDown ? maxLength - currentLength : currentLength;
      $counter.text(count);
    });
  });
}
