import util from 'util';

// config should be imorted before importing any other file
import config from './config/config';
import app from './config/express';




const debug = require('debug')('express-mongoose-es6-rest-api:index');

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
  });
}

export default app;
