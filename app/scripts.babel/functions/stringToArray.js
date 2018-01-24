/**
* カンマ区切りの文字列を配列に変換します。
* 空文字の場合は空の配列を返します。
* @param {String} string カンマ区切りの文字列
* @return {String[]} 配列
*/
export default function(string){
  return string !== '' ? string.split(',') : [];
}
