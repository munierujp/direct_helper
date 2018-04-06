export default class{
  /**
  * @param {Object} value 値
  */
  constructor(value){
    this.value = value;
  }

  /**
  * HasValueオブジェクトを生成します。
  * @param {Object} value 値
  * @return {HasValue} HasValueオブジェクト
  */
  static of(value){
    return new this(value);
  }
}
