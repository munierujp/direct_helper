import fetchSettings from '@functions/fetchSettings';
import actions from '@constants/actions';

/**
* 各種機能を実行します。
*/
export default async function(){
  const settings = await fetchSettings();

  Object.keys(actions)
    .filter(key => settings[key] === true)
    .map(key => actions[key])
    .forEach(action => action());
}
