/*
 *  VITauth
 *  Copyright (C) 2015  Kishore Narendran <kishore.narendran09@gmail.com>
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2015  Aarthy Kolachalam Chandrasekhar <kcaarthy@gmail.com>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var mongodb = require('express-mongo-db');
var multer = require('multer');
var os = require('os');
var path = require('path');

var newrelic;
if (process.env.NEWRELIC_APP_NAME && process.env.NEWRELIC_LICENSE) {
  newrelic = require('newrelic');
}

var log;
if (process.env.LOGENTRIES_TOKEN) {
  let logentries = require('node-logentries');
  log = logentries.logger({
    token: process.env.LOGENTRIES_TOKEN
  });
}

var webRoutes = require(path.join(__dirname, 'routes', 'web'));
var apiClientRoutes = require(path.join(__dirname, 'routes', 'api-client'));
var apiCentral = require(path.join(__dirname, 'routes', 'api-central'));
var apiClientFaculty = require(path.join(__dirname, 'routes', 'api-client-faculty'));

var app = express();

app.set('title', 'VITauth');

let loggerLevel = process.env.LOGGER_LEVEL || 'dev';
app.use(logger(loggerLevel));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// New Relic in Template
if (newrelic) {
  app.locals.newrelic = newrelic;
}

// Static
app.use(express.static(path.join(__dirname, 'public')));

// Favicon
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Cookie Parser
let secret = process.env.SECRET_KEY || 'randomsecretstring';
app.use(cookieParser(secret, {signed: true}));

// Multer for image uploading
app.use(multer({dest: os.tmpDir()}));

// MongoDB
let mongodbOptions = {
  hosts: [{
    host: process.env.MONGODB_HOST || '127.0.0.1',
    port: process.env.MONGODB_PORT || '27017'
  }],
  database: process.env.MONGODB_DATABASE || 'VITauth',
  username: process.env.MONGODB_USERNAME,
  password: process.env.MONGODB_PASSWORD,
  options: {
    db: {
      native_parser: true,
      recordQueryStats: true,
      retryMiliSeconds: 500,
      numberOfRetries: 10
    },
    server: {
      socketOptions: {
        keepAlive: 1,
        connectTimeoutMS: 10000
      },
      auto_reconnect: true,
      poolSize: 50
    },
    replset: {
      socketOptions: {
        keepAlive: 1,
        connectTimeoutMS: 10000
      }
    }
  }
};
app.use(mongodb(require('mongodb'), mongodbOptions));

app.use('/', webRoutes);
app.use('/api/central', apiCentral);
app.use('/api/client/faculty', apiClientFaculty);
app.use('/api/client', apiClientRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers
// Development error handler, will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    if (log) {
      log.log('debug', {Error: err, Message: err.message});
    }
    res.status(err.status || 500);
    res.render('error', {
      title: 'Error | VITauth',
      message: err.message,
      status: err.status,
      stack: err.stack
    });
  });
}

// Production error handler, no stacktraces leaked to user
app.use(function (err, req, res, next) {
  if (log) {
    log.log('debug', {Error: err, Message: err.message});
  }
  res.status(err.status || 500);
  res.render('error', {
    title: 'Error | VITauth',
    message: err.message,
    status: err.status,
    stack: ''
  });
});

module.exports = app;
