const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const viewRouter = require('./routes/viewRoutes')

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// for views
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
// 1) GLOBAL MIDDLEWARES

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security http headers
app.use(helmet())

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// to limit many request one IP
const limiter = rateLimit({
max: 100,
windowMs: 60*60*1000,
message: 'Rate limit exceeded! Too many request from this IP, please try again in an hour.',
});
app.use('/api', limiter);

// body parser, reading data from body onto req.body
app.use(express.json({ limit: '10kb' }));

// data sanitization again NoSql query injection
app.use(mongoSanitize());

// data sanitization agains xss
app.use(xss());

// Prevent parameter pollution
app.use(hpp( {
  whitelist : [ 
    'duration', 
    'ratingsQuality',
    'price',
    'difficulty',
    'ratingsAverage',
    'maxGroupSize'
  ]
}))


// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  /* console.log(req.headers); */
  next();
});



// 3) ROUTES
app.use('/', viewRouter);


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
