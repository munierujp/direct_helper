import createSettingMenuItem from '@views/setting/createSettingMenuItem';
import createSettingPage from '@views/setting/createSettingPage';
import acticateMenuItem from '@views/setting/acticateMenuItem';
import inacticateMenuItem from '@views/setting/inacticateMenuItem';
import findPageByLinkId from '@views/setting/findPageByLinkId';
import settingData from '@constants/settingData';

const HTML_ID_PREFIX = 'direct_helper-';
const ID_SETTING_PAGE = `${HTML_ID_PREFIX}${settingData.key}-page`;

/**
* 設定画面を描画します。
*/
export default async function(){
  const $menu = $('#navbar-menu');

  //右メニューに設定メニュー項目を追加
  const $settingMenuItem = createSettingMenuItem();
  const $rightMenu = $menu.find('.navbar-right');
  $rightMenu.append($settingMenuItem);

  //設定ページを追加
  const $environmentPage = $('#environment-page');
  const $settingPage = await createSettingPage($environmentPage);
  $settingPage.insertAfter($environmentPage);

  const $pages = $('#wrap .page');

  //設定メニュー項目クリック時にページ表示を切り替え
  $settingMenuItem.on('click', () => {
    //表示中のページを非表示
    const $menuItems = $menu.find('li');
    $menuItems.each((i, menuItem) => inacticateMenuItem($(menuItem)));
    $pages.each((i, page) => $(page).hide());

    //設定ページを表示
    acticateMenuItem($settingMenuItem);
    $settingPage.show();
  });

  //他のページ表示時に設定ページを非表示
  $pages
    .filter((i, page) => $(page).attr('id') !== ID_SETTING_PAGE)
    .each((i, page) => {
      Observer.of(page).attributes('style').hasChanged(records => {
        const visiblePages = records
          .map(record => record.target)
          .filter(page => $(page).is(':visible'));
        if(visiblePages.length){
          //設定ページを非表示
          inacticateMenuItem($settingMenuItem);
          $settingPage.hide();
        }
      }).start();
    });

  //左メニュー項目クリック時にページ表示を切り替え
  const $leftMenuItems = $menu.find('.navbar-left > li');
  $leftMenuItems.on('click', event => {
    //設定ページを非表示
    inacticateMenuItem($settingMenuItem);
    $settingPage.hide();

    //クリックしたページを表示
    const $menuItem = $(event.currentTarget);
    acticateMenuItem($menuItem);
    const linkId = $menuItem.find('a').attr('id');
    const $page = findPageByLinkId(linkId);
    $page.show();
  });
}
