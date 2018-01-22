import Talk from '@classes/Talk';
import TalkArea from '@classes/TalkArea';
import MessageArea from '@classes/MessageArea';
import fetchSettings from '@functions/fetchSettings';
import formatDate from '@functions/formatDate';
import observeAddingTalkArea from '@functions/observeAddingTalkArea';

/**
* メッセージの監視機能を実行します。
*/
async function doWatchMessage(){
  const settings = await fetchSettings();

  const talkIsRead = talkId => {
    const $talk = $(`#${talkId}`);
    const $cornerBadge = $talk.find('.corner-badge');
    return $cornerBadge.length === 0;
  };

  const talkMap = new Map();
  const observingTalkIds = [];

  //トーク一覧に子ノード追加時、トーク関連処理を実行
  const $talkLists = $('#talks');
  $talkLists.each((i, talkList) => {
    Observer.of(talkList).childList().hasChanged(records => {
      //デフォルト監視対象を監視対象に追加
      if(settings.watch_default_observe_talk === true){
        const readTalkIds = settings.default_observe_talk_ids.filter(talkIsRead);

        //既読デフォルト監視トークを監視対象に追加
        const talkIsNotObserving = talkId => !observingTalkIds.includes(talkId);
        readTalkIds.filter(talkIsNotObserving).forEach((talkId, index) => {
          const $talk = $(`#${talkId}`);
          observingTalkIds.push(talkId);

          //監視対象に追加するためにクリック
          $talk.click();

          //最後の場合はトークを閉じるために2回クリック
          const talkIsLast = index == readTalkIds.length -1;
          if(talkIsLast){
            $talk.click();
          }
        });
      }

      //トーク情報の更新
      records.forEach(record => {
        const talkItems = record.addedNodes;
        talkItems.forEach(talkItem => {
          const talkId = talkItem.id;
          const talkName = $(talkItem).find('.talk-name-part').text();
          const talk = Talk.of(talkId, talkName);
          talk.isRead = talkIsRead(talkId);
          talkMap.set(talkId, talk);
        });
      });
    }).start();
  });

  //メッセージ監視開始ログを表示
  const observeStartMessage = Replacer.of(
    [/<time>/g, formatDate(new Date(), settings.date_format)]
  ).exec(settings.custom_log_start_observe_messages);
  console.info(settings.log_label, observeStartMessage);

  //トークエリアの追加を監視
  observeAddingTalkArea(talkArea => {
    //トークを生成
    const talkId = talkArea.id.replace(/(multi\d?-)?msgs/, 'talk');
    const talk = talkMap.get(talkId);

    //トーク監視開始ログを表示
    const observeStartDate = new Date();
    const observeStartMessage = Replacer.of(
      [/<talkId>/g, talk.id],
      [/<time>/g, formatDate(observeStartDate, settings.date_format)],
      [/<talkName>/g, talk.name]
    ).exec(settings.custom_log_start_observe_talk);
    console.info(settings.log_label, observeStartMessage);

    //メッセージの追加を監視
    TalkArea.of(talkArea).observeAddingMessageArea(messageArea => {
      //メッセージを生成
      const message = MessageArea.of(messageArea).createMessage(settings, talk);

      //メッセージをコンソールに出力
      const messageIsNotPast = message.time > observeStartDate;
      if(messageIsNotPast || settings.show_past_message === true){
        message.log(settings);
      }
    });
  });
}

export default doWatchMessage;
