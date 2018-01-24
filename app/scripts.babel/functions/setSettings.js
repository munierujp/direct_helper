import storageKeys from '@constants/storageKeys';

const key = storageKeys.settings;

/**
* Chrome Sync Storageに設定をセットします。
* @param {Object} settings 設定
*/
export default function(settings){
  chrome.storage.sync.set({
    [key]: settings
  });
}
