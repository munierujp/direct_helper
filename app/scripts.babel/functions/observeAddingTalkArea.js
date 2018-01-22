/**
* トークエリアの追加を監視します。
* @param {Function} callback : talkArea => {...}
*/
function observeAddingTalkArea(callback){
  const $messagesAreas = $('#messages');
  $messagesAreas.each((i, messagesArea) => {
    //メッセージエリアに子ノード追加時、トークエリア関連処理を実行
    Observer.of(messagesArea).childList().hasChanged(records => {
      records.forEach(record => {
        const talkAreas = record.addedNodes;
        talkAreas.forEach(talkArea => callback(talkArea));
      });
    }).start();
  });
}

export default observeAddingTalkArea;
