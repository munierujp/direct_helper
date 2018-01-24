import TalkArea from '@classes/TalkArea';
import MessageArea from '@classes/MessageArea';
import fetchSettings from '@functions/fetchSettings';
import observeAddingTalkArea from '@functions/observeAddingTalkArea';

export default async function(){
  const settings = await fetchSettings();

  observeAddingTalkArea(talkArea => {
    TalkArea.of(talkArea).observeAddingMessageArea(messageArea => {
      if(MessageArea.of(messageArea).hasFile()){
        const $thumbnailArea = $(messageArea).find('.msg-text-contained-thumb');
        $thumbnailArea.width(settings.thumbnail_size);
      }
    });
  });
}
