const CLASS_ACTIVE_ITEM = 'active';

/**
* メニュー項目を非アクティブにします。
* @param {jQuery} $menuItem メニュー項目要素
*/
export default function($menuItem){
  $menuItem.removeClass(CLASS_ACTIVE_ITEM);
}
