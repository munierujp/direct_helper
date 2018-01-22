import Message from './Message';
import MessageTypes from '../enums/MessageTypes';
import UserTypes from '../enums/UserTypes';
import FileTypes from '../enums/FileTypes';
import StampTypes from '../enums/StampTypes';

/** メッセージエリア */
class MessageArea{
  /**
  * @param {Element} value メッセージエリア
  */
  constructor(value){
    this.value = value;
    this.$messageArea = $(this.value);
    this.$messageAreaFirstChild = this.$messageArea.find('div:first-child');
    this.$messageBodyArea = this.$messageAreaFirstChild.find('.msg-body');
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
      return $('#current-username').text();
    }else if(this.$messageAreaFirstChild.hasClass(UserTypes.OTHERS.value)){
      return this.$messageAreaFirstChild.find('.username').text();
    }
  }

  /**
  * 本文を取得します。
  * @param {Object} settings 設定
  * @return {String} 本文
  */
  getMessageBody(settings){
    const messageHasFile = this.messageType == MessageTypes.FILE || this.messageType == MessageTypes.FILE_AND_TEXT;
    const messageHasStamp = this.messageType == MessageTypes.STAMP;
    if(messageHasFile){
      const fileType = Object.values(FileTypes).find(fileType => this.$messageBodyArea.find('.msg-thumb').hasClass(fileType.value));
      const prefix = fileType == FileTypes.IMAGE ? settings.log_image : settings.log_file;
      const messageHasText = this.messageType == MessageTypes.FILE_AND_TEXT && !(this.$messageBodyArea.hasClass('no-text'));
      if(messageHasText){
        const text =this.$messageBodyArea.find('.msg-thumbs-text').text();
        return prefix + text;
      }else{
        return prefix;
      }
    }else if(messageHasStamp){
      const stampType = Object.values(StampTypes).find(stampType => this.$messageBodyArea.hasClass(stampType.value));
      if(stampType == StampTypes.NO_TEXT){
        return settings.log_stamp;
      }
    }

    //本文テキストのみを取得するために深く複製したノードからメッセージメニューを削除
    const $messageText = this.$messageBodyArea.find('.msg-text').clone();
    const $messageMenu = $messageText.find('.msg-menu-container');
    $messageMenu.remove();
    return $messageText.text();
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

    if(this.messageType == MessageTypes.STAMP){
      message.stamp = this.$messageBodyArea.find('img').get(0);
    }

    return message;
  }
}

export default MessageArea;
