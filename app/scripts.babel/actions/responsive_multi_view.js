export default function(){
  const singlePaneColor = $('#message-header').css('background-color');
  const $panes = $('#talk-panes-multi .talk-pane');
  const $firstPane = $panes.first();
  const $firstTimelineHeader = $firstPane.find('.timeline-header');
  const firstPaneColor = $firstTimelineHeader.css('background-color');

  $panes.each((i, pane) => {
    Observer.of(pane).attributes('class').hasChanged(() => {
      const $activePanes = $panes.filter((i, pane) => $(pane).hasClass('has-send-form'));
      const $inactivePanes = $panes.filter((i, pane) => $(pane).hasClass('no-send-form'));

      //アクティブペインを外側から表示
      $activePanes.each((i, pane) => {
        $(pane).show();
        const $timelinebody = $(pane).find('.timeline-body');
        $timelinebody.show();
        const $timelineHeader = $(pane).find('.timeline-header');
        const $timelineFotter = $(pane).find('.timeline-footer');
        const timelineBodyHeight = $(pane).height() - $timelineHeader.height() - $timelineFotter.height();
        $timelinebody.height(timelineBodyHeight);
        $timelinebody.scrollTop($timelinebody.prop('scrollHeight'));
      });

      //非アクティブペインを内側から非表示
      $inactivePanes.each((i, pane) => {
        const $timelinebody = $(pane).find('.timeline-body');
        $timelinebody.hide();
        $(pane).hide();
      });

      //アクティブペインがない場合は1番目のペインの空ビューを表示
      if(!$activePanes.length){
        $firstPane.show();
        $firstTimelineHeader.css('background-color', singlePaneColor);
      }else{
        $firstTimelineHeader.css('background-color', firstPaneColor);
      }
    }).start();
  });
}
