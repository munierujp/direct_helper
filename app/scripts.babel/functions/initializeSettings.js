import fetchSettings from '@functions/fetchSettings';
import setSettings from '@functions/setSettings';
import settingData from '@constants/settingData';

/**
* 設定を初期化します。
*/
async function initializeSettings(){
  const settings = await fetchSettings();

  //未設定項目にデフォルト値を設定
  settingData.sections.forEach(section => {
    section.items
    .filter(item => settings[item.key] === undefined)
    .forEach(item => settings[item.key] = item.default);
  });

  setSettings(settings);
}

export default initializeSettings;
