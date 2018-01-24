/**
* リンクIDからページ要素を取得します。
* @param {String} linkId リンクID
* @return {jQuery} ページ要素
*/
export default function(linkId){
  const pageId = linkId.replace(/navbar-menu-(.+)/, '$1-page');
  return $(`#${pageId}`);
}
