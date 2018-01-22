import path from 'path';

const PATH_SCRIPTS = path.resolve(__dirname, 'app/scripts.module');

module.exports = {
  entry: {
    'background': './app/scripts.module/background.js',
    'chromereload': './app/scripts.module/chromereload.js',
    'main': './app/scripts.module/main.js'
  },
  output: {
    filename: '[name].js'
  },
  resolve: {
    alias: {
      '@scripts': PATH_SCRIPTS,
      '@classes': path.resolve(PATH_SCRIPTS, 'classes'),
      '@constants': path.resolve(PATH_SCRIPTS, 'constants'),
      '@enums': path.resolve(PATH_SCRIPTS, 'enums'),
      '@functions': path.resolve(PATH_SCRIPTS, 'functions'),
      '@actions': path.resolve(PATH_SCRIPTS, 'actions')
    }
  }

};
