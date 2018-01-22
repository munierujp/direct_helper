/**
* マルチビューのレスポンシブ化機能を実行します。
*/
function doResponsiveMultiView(){
  const $multiPaneArea = $('#talk-panes-multi');
  const $talkPanes = $multiPaneArea.find('.talk-pane');
  const $firstTalkPane = $talkPanes.first();
  const $firstTimelineHeader = $firstTalkPane.find('.timeline-header');
  const firstTalkPaneColor = $firstTimelineHeader.css('background-color');

  $talkPanes.each((i, talkPane) => {
    //トークペインのclass属性変更時、表示を切り替え
    Observer.of(talkPane).attributes('class').hasChanged(records => {
      records.forEach(record => {
        const $activeTalkPanes = $talkPanes.filter((i, talkPane) => $(talkPane).hasClass('has-send-form'));
        const $inactiveTalkPanes = $talkPanes.filter((i, talkPane) => $(talkPane).hasClass('no-send-form'));

        //アクティブペインを外側から表示
        $activeTalkPanes.each((i, talkPane) => {
          $(talkPane).show();
          const $timelinebody = $(talkPane).find('.timeline-body');
          $timelinebody.show();
          const $timelineHeader = $(talkPane).find('.timeline-header');
          const $timelineFotter = $(talkPane).find('.timeline-footer');
          $timelinebody.height($(talkPane).prop('clientHeight') - $timelineHeader.prop('clientHeight') - $timelineFotter.prop('clientHeight'));
          $timelinebody.scrollTop($timelinebody.prop('scrollHeight'));
        });

        //非アクティブペインを内側から非表示
        $inactiveTalkPanes.each((i, talkPane) => {
          const $timelinebody = $(talkPane).find('.timeline-body');
          $timelinebody.hide();
          $(talkPane).hide();
        });

        //アクティブペインがない場合は1番目のペインの空ビューを表示
        if($activeTalkPanes.length === 0){
          $firstTalkPane.show();
          const $emptyView = $firstTalkPane.find('.empty-view-container-for-timeline');
          $emptyView.removeClass('hide');
          $firstTimelineHeader.css('background-color', '#ffffff');
        }else{
          $firstTimelineHeader.css('background-color', firstTalkPaneColor);
        }
      });
    }).start();
  });
}

export default doResponsiveMultiView;
