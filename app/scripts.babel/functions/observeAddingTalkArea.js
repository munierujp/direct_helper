/**
* トークエリアの追加を監視します。
* @param {Function} callback : talkArea => {...}
*/
export default function(callback){
  const $messagesAreas = $('#messages');
  $messagesAreas.each((i, messagesArea) => {
    Observer.of(messagesArea).childList().hasChanged(records => {
      records
        .map(record => record.addedNodes)
        .forEach(talkAreas => talkAreas.forEach(callback));
    }).start();
  });
}
