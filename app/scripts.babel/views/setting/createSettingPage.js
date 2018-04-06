import appendSettingSection from '@views/setting/appendSettingSection';
import fetchSettings from '@functions/fetchSettings';
import settingData from '@constants/settingData';

const HTML_ID_PREFIX = 'direct_helper-';
const ID_SETTING_PAGE = `${HTML_ID_PREFIX}${settingData.key}-page`;

/**
* 設定ページ要素を作成します。
* @param {jQuery} $environmentPage 環境設定ページ要素
* @return {jQuery} 設定ページ要素
*/
export default async function($environmentPage){
  const $settingPage = $(`<div class="page" id="${ID_SETTING_PAGE}"></div>`).css({
    'max-width': $environmentPage.css('max-width'),
    'margin-left': $environmentPage.css('margin-left'),
    'margin-right': $environmentPage.css('margin-right'),
    'height': $environmentPage.css('height'),
    'padding-bottom': $environmentPage.css('padding-bottom'),
    'display': 'none'
  });
  $settingPage.append(`<h3 class="page-title"><span class="page-title-glyphicon glyphicon glyphicon-cog"></span>  ${settingData.name}</h3>`);
  $settingPage.append(`<div>${settingData.description}</div>`);
  const settings = await fetchSettings();
  settingData.sections.forEach(section => appendSettingSection($settingPage, section, settings));
  return $settingPage;
}
