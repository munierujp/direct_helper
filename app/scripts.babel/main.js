import 'babel-polyfill';

import initializeSettings from '@functions/initializeSettings';
import drawSettingView from '@functions/drawSettingView';
import doActions from '@functions/doActions';

(function(){
  'use strict';

  //設定の初期化
  initializeSettings()
  .then(() => {
    //設定画面の描画
    drawSettingView();

    //各種機能の実行
    doActions();
  });
})();
