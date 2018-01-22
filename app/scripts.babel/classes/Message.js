import Talk from './Talk';
import formatDate from '../functions/formatDate';

/** メッセージ */
class Message{
  /**
  * @param {Talk} talk Talkオブジェクト
  * @throws {TypeError} talkの型がTalkではない場合
  */
  constructor(talk){
    if(!(talk instanceof Talk)){
      throw new TypeError(talk + ' is not instance of Talk');
    }
    this.talk = talk;
  }

  /**
  * Messageオブジェクトを生成します。
  * @param {Talk} talk Talkオブジェクト
  * @return {Message} Messageオブジェクト
  */
  static of(talk){
    return new this(talk);
  }

  /**
  * メッセージをコンソールに出力します。
  * @param {Object} settings 設定
  */
  log(settings){
    const header = Replacer.of(
      [/<talkId>/g, this.talk.id],
      [/<time>/g, formatDate(this.time, settings.date_format)],
      [/<talkName>/g, this.talk.name],
      [/<userName>/g, this.userName]
    ).exec(settings.custom_log_message_header);

    console.group(header);
    Optional.ofAbsentable(this.stamp)
      .ifPresent(stamp => console.log(settings.log_label, this.body, stamp))
      .ifAbsent(() => console.log(settings.log_label, this.body));
    console.groupEnd();
  }
}

export default Message;
