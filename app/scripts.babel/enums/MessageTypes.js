import MessageType from '@classes/MessageType';

/** メッセージ種別 */
const MessageTypes = {
  DELETED: new MessageType('msg-type-deleted'),
  FILE: new MessageType('msg-type-file'),
  FILE_AND_TEXT: new MessageType('msg-type-textMultipleFile'),
  STAMP: new MessageType('msg-type-stamp'),
  SYSTEM: new MessageType('msg-type-system'),
  TEXT: new MessageType('msg-type-text')
};

export default MessageTypes;
