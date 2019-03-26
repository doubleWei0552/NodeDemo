'use strict'

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const db = 'mongodb://localhost/test'

/**
 * mongoose连接数据库
 * @type {[type]}
 */
mongoose.Promise = require('bluebird')
mongoose.connect(db)

/**
 * 获取数据库表对应的js对象所在的路径
 * @type {[type]}
 */
const models_path = path.join(__dirname, '/app/models')


/**
 * 已递归的形式，读取models文件夹下的js模型文件，并require
 * @param  {[type]} modelPath [description]
 * @return {[type]}           [description]
 */
var walk = function(modelPath) {
  fs
    .readdirSync(modelPath)
    .forEach(function(file) {
      var filePath = path.join(modelPath, '/' + file)
      var stat = fs.statSync(filePath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(filePath)
        }
      }
      else if (stat.isDirectory()) {
        walk(filePath)
      }
    })
}
walk(models_path)

require('babel-register')
const Koa = require('koa')
const logger = require('koa-logger')
const session = require('koa-session')
const bodyParser = require('koa-bodyparser')
const cors = require('koa2-cors');
const app = new Koa();
app.use(cors({
  origin: function(ctx) {
    if (ctx.url === '/test') {
      return false;
    }
    return ['http://39.98.51.33:8000'];
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
app.keys = ['weiwei']
app.use(logger())
app.use(session(app))
app.use(bodyParser())


/**
 * 使用路由转发请求
 * @type {[type]}
 */
const router = require('./config/router')()

app
  .use(router.routes())
  .use(router.allowedMethods());

/**
 * swagger API文档
 */
  const views = require('koa-render')
  , serve = require('koa-static')
  , swagger =  require('./lib/swagger-koa')
  // , api = require('./example/api')

const  port = 9000;
   

app.use(views('./example/views', { default: 'jade' }));

app.use(swagger.init({
  apiVersion: '1.0',
  swaggerVersion: '1.0',
  basePath: 'http://localhost:' + port,
  swaggerURL: '/swagger',
  swaggerJSON: '/api-docs.json',
  swaggerUI: './example/public/swagger/',
  apis: ['./example/api.js', './example/api.yml', './example/api.coffee']
}));

app.use(serve(path.join(__dirname, './example/public')));

// app.use(router.get('/', async (ctx, next) => {
//   ctx.body = await ctx.render('index', { title: 'Koa' });
// }));

// app.use(router.post('/login', api.login));

app.listen(port)
console.log('app started at port ' + port);