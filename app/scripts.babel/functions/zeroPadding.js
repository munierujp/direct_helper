/**
* 数値を指定した桁数になるようにゼロ埋めします。
* @param {Number} num 数値
* @param {Number} digits 桁数
* @return {String} ゼロ埋めした文字列
*/
export default function(num, digits){
  const source = String(num);
  let zeros = '';
  for(let i = 0; i < digits - source.length; i++){
    zeros += '0';
  }
  return zeros + source;
}
