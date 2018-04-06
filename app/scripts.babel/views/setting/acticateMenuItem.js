const CLASS_ACTIVE_ITEM = 'active';

/**
* メニュー項目をアクティブにします。
* @param {jQuery} $menuItem メニュー項目要素
*/
export default function($menuItem){
  $menuItem.addClass(CLASS_ACTIVE_ITEM);
}
