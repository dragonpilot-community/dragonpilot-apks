module.exports = function(api) {
  api.cache(true);

  config = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: ['macros'],
  };
  if (process.env.NODE_ENV === 'production' || process.env.BABEL_ENV === 'production') {
    config.plugins.push('transform-remove-console');
  }
  return config;
}
