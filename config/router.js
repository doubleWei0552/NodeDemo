'use strict'

const Router = require('koa-router')
const User = require('../app/controllers/user')
const Article = require('../app/controllers/article')
const App = require('../app/controllers/app')
const Service = require('../app/services/service')

module.exports = function(){
	var router = new Router({
    prefix: '/API'
  })

  // apidoc
  router.get('/apidoc', function (req, res, next) {
    　　res.type('text/html')
    　　res.sendfile('public/apidoc/index.html');
    });

  // user
  /**
* @api {post} /u/signup 注册
* @apiDescription 注册用户
* @apiName a/a
* @apiParam {String} userName 用户名
* @apiParam {String} password 密码
* @apiParam {String} mobile 手机号
* @apiSuccessExample {json} Success-Response:
* {
* "success": true,
* "data":{}
* }
* @apiErrorExample {json} Error-Response:
* {
* "success": false,
* }
* @apiVersion 1.0.0
*/
  router.post('/u/signup', App.hasBody, User.signup);
  /**
* @api {post} /u/login 登录
* @apiDescription 用户登录
* @apiName a/b
* @apiParam {String} userName 用户名
* @apiParam {String} password 密码
* @apiParam {String} mobile 手机号
* @apiSuccessExample {json} Success-Response:
* {
* "success": true,
* "data":{}
* }
* @apiErrorExample {json} Error-Response:
* {
* "success": false,
* }
* @apiVersion 1.0.0
*/
  router.post('/u/login', App.hasBody, User.login)
   /**
* @api {get} /u/current 查询当前用户
* @apiDescription 用户登录
* @apiName a/c
* @apiSuccessExample {json} Success-Response:
* {
* "success": true,
* "data":{}
* }
* @apiErrorExample {json} Error-Response:
* {
* "success": false,
* }
* @apiVersion 1.0.0
*/
  router.get('/u/current', User.current)
  /**
* @api {post} /u/updataCurrent 更新当前用户
* @apiDescription 更新当前用户
* @apiName a/d
* @apiParam {String} name 姓名
* @apiParam {String} mail 邮箱
* @apiParam {String} phoneNumber 手机号
* @apiParam {String} avatar 头像
* @apiSuccessExample {json} Success-Response:
* {
* "success": true,
* "data":{}
* }
* @apiErrorExample {json} Error-Response:
* {
* "success": false,
* }
* @apiVersion 1.0.0
*/
  router.post('/u/updataCurrent', App.hasBody, App.hasToken, User.update)
   /**
* @api {get} /u/allusers 获取所有用户
* @apiDescription 获取所有用户
* @apiName a/e
* @apiParam {String} pageIndex 页码
* @apiParam {String} pageSize 条数
* @apiSuccessExample {json} Success-Response:
* {
* "success": true,
* "data":{}
* }
* @apiErrorExample {json} Error-Response:
* {
* "success": false,
* }
* @apiVersion 1.0.0
*/
  router.get('/u/allusers', App.hasToken, User.getAlllUsers)
    /**
* @api {post} /u/uploadavatar 上传图片
* @apiDescription 上传图片
* @apiName a/f
* @apiSuccessExample {json} Success-Response:
* {
* "success": true,
* "data":{}
* }
* @apiErrorExample {json} Error-Response:
* {
* "success": false,
* }
* @apiVersion 1.0.0
*/
  router.post('/u/uploadavatar', User.UploadAvatar)

  // article
      /**
* @api {post} /article/createarticle 创建文章
* @apiDescription 创建文章
* @apiName b/a
* @apiParam {String} type 类别
* @apiParam {String} articleName 文章名
* @apiParam {Boolean} isDraft 是否是草稿
* @apiParam {String} content 内容
* @apiSuccessExample {json} Success-Response:
* {
* "success": true,
* "data":{}
* }
* @apiErrorExample {json} Error-Response:
* {
* "success": false,
* }
* @apiVersion 1.0.0
*/
  router.post('/article/createarticle', App.hasBody, App.hasToken, Article.createArticle)
  /**
* @api {get} /article/myarticles 获取我的所有文章
* @apiDescription 获取我的所有文章
* @apiName b/b
* @apiParam {String} pageIndex 页码
* @apiParam {String} pageSize 条数
* @apiSuccessExample {json} Success-Response:
* {
* "success": true,
* "data":{}
* }
* @apiErrorExample {json} Error-Response:
* {
* "success": false,
* }
* @apiVersion 1.0.0
*/
router.get('/article/myarticles', App.hasToken, Article.getMyArticles)
  /**
* @api {get} /article/getArticleById 根据文章ID查询文章
* @apiDescription 根据文章ID查询文章
* @apiName b/c
* @apiParam {String} id 文章的_id
* @apiSuccessExample {json} Success-Response:
* {
* "success": true,
* "data":{}
* }
* @apiErrorExample {json} Error-Response:
* {
* "success": false,
* }
* @apiVersion 1.0.0
*/
router.get('/article/getArticleById', Article.getArticleById)
  /**
* @api {get} /article/deleteArticleById 根据文章ID删除文章
* @apiDescription 根据文章ID删除文章
* @apiName b/d
* @apiParam {String} id 文章的_id
* @apiSuccessExample {json} Success-Response:
* {
* "success": true,
* "data":{}
* }
* @apiErrorExample {json} Error-Response:
* {
* "success": false,
* }
* @apiVersion 1.0.0
*/
router.delete('/article/deleteArticleById', App.hasToken, Article.deleteArticleById)
  // 七牛云
  router.post('/qiniu/signature', Service.getUploadToken)

  // DB Interface test
  router.get('/test/user/users',User.users)
  router.post('/test/user/add',User.addUser)
  router.post('/test/user/delete',User.deleteUser)

  return router
}