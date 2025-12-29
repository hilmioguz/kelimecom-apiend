const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const schedule = require('node-schedule');
// const httpStatus = require('http-status');
const fs = require('fs');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter, apiLimiter, searchLimiter, sitelanguageLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
// const ApiError = require('./utils/ApiError');
const Madde = require('./models/madde.model');
const generalSearchController = require('./controllers/generalSearch.controller');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

global.__basedir = `${__dirname}`;

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(
  express.urlencoded({
    extended: true,
  })
);

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// Rate limiting - GEÇİCİ OLARAK KAPALI
// app.use('/v1', apiLimiter); // Genel API rate limiting

// limit repeated failed requests to auth endpoints
// if (config.env === 'production') {
//   app.use('/v1/auth', authLimiter);
// }

// Özel endpoint rate limiting - GEÇİCİ OLARAK KAPALI
// app.use('/v1/generalsearch', searchLimiter);
// app.use('/v1/sitelanguage', sitelanguageLimiter);

// v1 api routes
app.use('/v1', routes);
// send back a 404 error for any unknown api request
// app.use((req, res, next) => {
//   next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
// });

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

const getRandomMadde = async () => {
  const dcount = await Madde.countDocuments();
  // eslint-disable-next-line no-console
  const randomnum = Math.floor(Math.random() * dcount);
  if (randomnum) {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFileSync(`${__dirname}/randomMadde.txt`, randomnum.toString(), { flag: 'w+' });
    } catch (err) {
      // Docker container'da dosya yazma izni yoksa sessizce devam et
      // Bu dosya sadece cache için kullanılıyor, kritik değil
      // eslint-disable-next-line no-console
      console.warn('randomMadde.txt dosyasına yazılamadı (izin hatası):', err.message);
    }
  }
};

const updateDigeryazim = async () => {
  // eslint-disable-next-line no-console
  console.log('Updating diger yazim...');
  generalSearchController.updateDigeryazim();
};

const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.date = 1;
rule.tz = 'Europe/Istanbul';
schedule.scheduleJob(rule, updateDigeryazim);

setTimeout(() => getRandomMadde(), 3000);
setInterval(getRandomMadde, 1000 * 60 * 60 * 24);
module.exports = app;
