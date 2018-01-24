import Message from '@classes/Message';
import MessageTypes from '@enums/MessageTypes';
import UserTypes from '@enums/UserTypes';
import FileTypes from '@enums/FileTypes';
import StampTypes from '@enums/StampTypes';

/** メッセージエリア */
export default class{
  /**
  * @param {Element} value メッセージエリア
  */
  constructor(value){
    this.value = value;
    this.$messageArea = $(this.value);
    this.$messageAreaFirstChild = this.$messageArea.find('div:first-child');
    this.$userName = this.$messageAreaFirstChild.find('.username');
    this.$messageBodyArea = this.$messageAreaFirstChild.find('.msg-body');
    this.$thumbnail = this.$messageBodyArea.find('.msg-thumb');
    this.$thumbnailText = this.$messageBodyArea.find('.msg-thumbs-text');
    this.$stamp = this.$messageBodyArea.find('img');
    this.messageType = Object.values(MessageTypes).find(messageType => this.$messageBodyArea.hasClass(messageType.value));
  }

  /**
  * MessageAreaオブジェクトを生成します。
  * @param {Element} value メッセージエリア
  * @return {MessageArea} MessageAreaオブジェクト
  */
  static of(value){
    return new this(value);
  }

  /**
  * ユーザー名を取得します。
  * @param {Object} settings 設定
  * @return {String} ユーザー名
  */
  getUserName(settings){
    if(this.$messageAreaFirstChild.hasClass(UserTypes.SYSTEM.value)){
      return settings.user_name_system;
    }else if(this.$messageAreaFirstChild.hasClass(UserTypes.ME.value)){
      const $currentUserName = $('#current-username');
      return $currentUserName.text();
    }else if(this.$messageAreaFirstChild.hasClass(UserTypes.OTHERS.value)){
      return this.$userName.text();
    }
  }

  /**
  * 本文を取得します。
  * @param {Object} settings 設定
  * @return {String} 本文
  */
  getMessageBody(settings){
    if(this.hasFile()){
      const fileType = Object.values(FileTypes).find(fileType => this.$thumbnail.hasClass(fileType.value));
      const prefix = fileType == FileTypes.IMAGE ? settings.log_image : settings.log_file;
      return this.$thumbnailText.length ? prefix + this.$thumbnailText.text() : prefix;
    }else if(this.hasStamp()){
      const stampType = Object.values(StampTypes).find(stampType => this.$messageBodyArea.hasClass(stampType.value));
      if(stampType == StampTypes.NO_TEXT){
        return settings.log_stamp;
      }
    }

    //本文テキストのみを取得するために深く複製したノードからメッセージメニューを削除
    const $messageText = this.$messageBodyArea.find('.msg-text').clone();
    $messageText.find('.msg-menu-container').remove();
    return $messageText.text();
  }

  /**
  * ファイルを持っているかどうかを判定します。
  * @return {Boolean} ファイルを持っているか
  */
  hasFile(){
    return this.messageType == MessageTypes.FILE || this.messageType == MessageTypes.FILE_AND_TEXT;
  }

  /**
  * スタンプを持っているかどうかを判定します。
  * @return {Boolean} スタンプを持っているか
  */
  hasStamp(){
    return this.messageType == MessageTypes.STAMP;
  }

  /**
  * Messageオブジェクトを作成します。
  * @param {Object} settings 設定
  * @param {Talk} talk Talkオブジェクト
  * @return {Message} Messageオブジェクト
  */
  createMessage(settings, talk){
    const message = Message.of(talk);
    message.type = this.messageType;
    message.time = new Date(Number(this.$messageArea.attr('data-created-at')));
    message.userName = this.getUserName(settings);
    message.body = this.getMessageBody(settings);

    if(this.hasStamp()){
      message.stamp = this.$stamp.get(0);
    }

    return message;
  }
}
