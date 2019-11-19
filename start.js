const config = require('./config');
const logger = require('koa-logger');

const mongoConfig = require('./config').mongo;
const app = require('./index.js')(mongoConfig);

app.use(logger());
app.listen(config.port);
