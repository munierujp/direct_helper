import storageKeys from '@constants/storageKeys';

const key = storageKeys.settings;

/**
* Chrome Sync Storageから設定をフェッチします。
* @return {Promise} 設定をフェッチするPromise(resolve:settings => {...})
*/
export default function(){
  return new Promise(resolve => {
    chrome.storage.sync.get(key, items => {
      const settings = Optional.ofAbsentable(items[key]).orElse({});
      resolve(settings);
    });
  });
}
