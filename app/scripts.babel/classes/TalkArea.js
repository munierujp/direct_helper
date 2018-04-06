import HasValue from '@classes/HasValue';

/** トークエリア */
export default class extends HasValue{
  /**
  * メッセージエリアの追加を監視します。
  * @param {Function} callback : messageArea => {...}
  */
  observeAddingMessageArea(callback){
    const $realMessageAreas = $(this.value).find('.real-msgs');
    $realMessageAreas.each((i, realMessageArea) => {
      Observer.of(realMessageArea).childList().hasChanged(records => {
        records
          .map(record => record.addedNodes)
          .map(nodeList => Array.from(nodeList))
          .forEach(nodes => {
            nodes
              .filter(node => node.className == 'msg')
              .forEach(callback);
          });
      }).start();
    });
  }
}
