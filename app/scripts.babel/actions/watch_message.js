import Talk from '@classes/Talk';
import TalkArea from '@classes/TalkArea';
import MessageArea from '@classes/MessageArea';
import fetchSettings from '@functions/fetchSettings';
import formatDate from '@functions/formatDate';
import observeAddingTalkArea from '@functions/observeAddingTalkArea';

export default async function(){
  const settings = await fetchSettings();
  const talkMap = new Map();

  const $talkList = $('#talks');
  $talkList.each((i, talkList) => {
    Observer.of(talkList).childList().hasChanged(records => {
      //デフォルト監視対象を監視対象に追加
      if(settings.watch_default_observe_talk){
        const readTalkIds = settings.default_observe_talk_ids.filter(talkIsRead);
        readTalkIds
          .map(talkId => $(`#${talkId}`))
          .forEach($talkItem => $talkItem.click());
        readTalkIds
          .filter(talkAreaIsVisible)
          .map(talkId => $(`#${talkId}`))
          .forEach($talkItem => $talkItem.click());
      }

      //トーク情報の更新
      records
        .map(record => record.addedNodes)
        .forEach(talkItems => {
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
  const observeStartDate = new Date();
  const observeStartMessage = Replacer.of(
    [/<time>/g, formatDate(observeStartDate, settings.date_format)]
  ).exec(settings.custom_log_start_observe_messages);
  console.info(settings.log_label, observeStartMessage);

  observeAddingTalkArea(talkArea => {
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

    TalkArea.of(talkArea).observeAddingMessageArea(messageArea => {
      const message = MessageArea.of(messageArea).createMessage(settings, talk);
      if(message.time > observeStartDate || settings.show_past_message){
        message.log(settings);
      }
    });
  });
}

/**
* トークが既読かどうかを判定します。
* @param  {String} talkId トークID
* @return {Boolean} トークが既読かどうか
*/
function talkIsRead(talkId){
  const $unreadBadge = $(`#${talkId} .corner-badge`);
  return !$unreadBadge.length;
}

/**
* トークエリアが表示状態かどうかを判定します。
* @param  {String} talkId トークID
* @return {Boolean} トークエリアが表示状態かどうか
*/
function talkAreaIsVisible(talkId){
  const id = talkId.replace(/talk/, 'msgs');
  const $talkArea = $(`#${id}`);
  return $talkArea.is(':visible');
}
