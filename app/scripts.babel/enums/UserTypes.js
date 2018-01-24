import UserType from '@classes/UserType';

export default {
  ME: new UserType('my-msg'),
  OTHERS: new UserType('your-msg'),
  SYSTEM: new UserType('system-msg')
}
