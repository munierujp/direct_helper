import HasValue from '@classes/HasValue';

/** トークエリア */
class TalkArea extends HasValue{
  /**
  * メッセージエリアの追加を監視します。
  * @param {Function} callback : messageArea => {...}
  */
  observeAddingMessageArea(callback){
    const realMessageArea = this.value.querySelector('.real-msgs');
    Observer.of(realMessageArea).childList().hasChanged(records => {
      records.forEach(record => {
        Array.from(record.addedNodes)
          .filter(node => node.className == 'msg')
          .forEach(messageArea => callback(messageArea));
      });
    }).start();
  }
}

export default TalkArea;
