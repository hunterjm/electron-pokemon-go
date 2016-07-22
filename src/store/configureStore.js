if (process.env.NODE_ENV === 'development') {
  module.exports = require('./configureStore.development');
} else {
  module.exports = require('./configureStore.production');
}
