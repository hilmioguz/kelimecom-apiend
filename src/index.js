const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const configInit = require('./config/init');

// MongoDB query logging'i aktif et
require('./middlewares/mongoLogger');

// Mongoose deprecation warning'ini düzelt
mongoose.set('strictQuery', false);

// MongoDB bağlantı durumu kontrolü
const checkMongoConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    logger.error('MongoDB connection lost! ReadyState:', mongoose.connection.readyState);
    return false;
  }
  return true;
};

// Her 30 saniyede bir MongoDB bağlantısını kontrol et
setInterval(() => {
  if (!checkMongoConnection()) {
    logger.error('MongoDB connection check failed, attempting to reconnect...');
    mongoose.connect(config.mongoose.url, config.mongoose.options)
      .then(() => {
        logger.info('MongoDB reconnected successfully');
      })
      .catch((error) => {
        logger.error('MongoDB reconnection failed:', error);
      });
  }
}, 30000);

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info('Connected to MongoDB');
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
      configInit();
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    logger.error('API server will not start due to MongoDB connection failure');
    process.exit(1);
  });

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
