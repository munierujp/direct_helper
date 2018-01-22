/** トーク */
class Talk{
  /**
  * @param {String} id トークID
  * @param {String} name トーク名
  */
  constructor(id, name){
    this.id = id;
    this.name = name;
  }

  /**
  * Talkオブジェクトを生成します。
  * @param {String} id トークID
  * @param {String} name トーク名
  * @return {Talk} Talkオブジェクト
  */
  static of(id, name){
    return new this(id, name);
  }
}

export default Talk;
