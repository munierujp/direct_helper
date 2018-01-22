import doBlurThumbnail from '@actions/doBlurThumbnail';
import doChangeThumbnailSize from '@actions/doChangeThumbnailSize';
import doConfirmSendMessageButton from '@actions/doConfirmSendMessageButton';
import doExpandUserIcon from '@actions/doExpandUserIcon';
import doResponsiveMultiView from '@actions/doResponsiveMultiView';
import doShowMessageCount from '@actions/doShowMessageCount';
import doWatchMessage from '@actions/doWatchMessage';

export default {
  blur_thumbnail: doBlurThumbnail,
  change_thumbnail_size: doChangeThumbnailSize,
  confirm_send_message_button: doConfirmSendMessageButton,
  expand_user_icon: doExpandUserIcon,
  responsive_multi_view: doResponsiveMultiView,
  show_message_count: doShowMessageCount,
  watch_message: doWatchMessage
};
