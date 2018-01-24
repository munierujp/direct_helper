import 'babel-polyfill';

import initializeSettings from '@functions/initializeSettings';
import drawSettingView from '@views/setting/drawSettingView';
import doActions from '@functions/doActions';

(function(){
  'use strict';

  initializeSettings()
  .then(() => {
    drawSettingView();
    doActions();
  });
})();
