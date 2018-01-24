import settingData from '@constants/settingData';

const HTML_ID_PREFIX = 'direct_helper-';
const ID_SETTING_LINK = `navbar-menu-${HTML_ID_PREFIX}${settingData.key}`;
const PATH_ICON = 'images/icon_32.png';

/**
* 設定メニュー項目要素を作成します。
* @return {jQuery} 設定メニュー項目要素
*/
export default function(){
  const $settingMenuItem = $('<li></li>').css('cursor', 'pointer');
  const $settingMenuLink = $(`<a id="${ID_SETTING_LINK}" class="navbar-menu" data-original-title="${settingData.name}"></a>`);
  const iconURL = chrome.runtime.getURL(PATH_ICON);
  $settingMenuLink.append(`<img src="${iconURL}">`);
  $settingMenuLink.append(`<span class="navbar-menu-text">${settingData.name}</span>`);
  $settingMenuItem.append($settingMenuLink);
  return $settingMenuItem;
}
