import UserType from '@classes/UserType';

/** ユーザー種別 */
const UserTypes = {
  ME: new UserType('my-msg'),
  OTHERS: new UserType('your-msg'),
  SYSTEM: new UserType('system-msg')
};

export default UserTypes;
