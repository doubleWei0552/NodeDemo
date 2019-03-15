'use strict'

const Router = require('koa-router')
const User = require('../app/controllers/user')
const App = require('../app/controllers/app')

module.exports = function(){
	var router = new Router({
    prefix: '/API'
  })

  // user
  router.post('/u/signup', App.hasBody, User.signup)
  router.post('/u/login', App.hasBody, User.login)
  router.get('/u/current', User.current)
  router.post('/u/updataCurrent', App.hasBody, App.hasToken, User.update)

  // DB Interface test
  router.get('/test/user/users',User.users)
  router.post('/test/user/add',User.addUser)
  router.post('/test/user/delete',User.deleteUser)

  return router
}