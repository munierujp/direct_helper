module.exports = {
  entry: {
    'background': './app/scripts.module/background.js',
    'chromereload': './app/scripts.module/chromereload.js',
    'main': './app/scripts.module/main.js'
  },
  output: {
    filename: '[name].js'
  }
};
