/**
* 配列をSuperMapに変換します。
* @param {Object[]} array 配列
* @return {SuperMap} SuperMap
*/
export default function(array){
  const map = SuperMap.empty();
  array.forEach((element, index) => map.set(index, element));
  return map;
}
