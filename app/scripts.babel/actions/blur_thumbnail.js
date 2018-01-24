import TalkArea from '@classes/TalkArea';
import MessageArea from '@classes/MessageArea';
import fetchSettings from '@functions/fetchSettings';
import observeAddingTalkArea from '@functions/observeAddingTalkArea';

export default async function(){
  const settings = await fetchSettings();

  observeAddingTalkArea(talkArea => {
    TalkArea.of(talkArea).observeAddingMessageArea(messageArea => {
      if(MessageArea.of(messageArea).hasFile()){
        const $thumbnails = $(messageArea).find('.msg-text-contained-thumb img');
        $thumbnails.each((i, thumbnail) => {
          $(thumbnail).css('filter', `blur(${settings.thumbnail_blur_grade}px)`);
        });
      }
    });
  });
}
