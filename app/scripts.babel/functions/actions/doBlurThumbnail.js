import TalkArea from '@classes/TalkArea';
import MessageArea from '@classes/MessageArea';
import fetchSettings from '@functions/fetchSettings';
import observeAddingTalkArea from '@functions/observeAddingTalkArea';
import MessageTypes from '@enums/MessageTypes';

/**
* サムネイル画像をぼかす機能を実行します。
*/
async function doBlurThumbnail(){
  const settings = await fetchSettings();

  //トークエリアの追加を監視
  observeAddingTalkArea(talkArea => {
    //メッセージの追加を監視
    TalkArea.of(talkArea).observeAddingMessageArea(messageArea => {
      const messageType = MessageArea.of(messageArea).messageType;
      const messageHasFile = messageType == MessageTypes.FILE || messageType == MessageTypes.FILE_AND_TEXT;
      if(messageHasFile){
        const $thumbnailArea = $(messageArea).find('.msg-text-contained-thumb');
        const $thumbnails = $thumbnailArea.find('img');
        $thumbnails.each((i, thumbnail) => $(thumbnail).css('filter', `blur(${settings.thumbnail_blur_grade}px)`));
      }
    });
  });
}

export default doBlurThumbnail;
