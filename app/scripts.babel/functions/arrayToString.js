/**
* 配列をカンマ区切りの文字列に変換します。
* 配列が空の場合は空文字を返します。
* @param {String[]} array
* @return {String} カンマ区切りの文字列
*/
function arrayToString(array){
  return array.join(',');
}

export default arrayToString;
