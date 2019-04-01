'use strict'

var xss = require('xss')
var mongoose =  require('mongoose')
var Article = mongoose.model('Article')
var User = mongoose.model('User')
var uuid = require('uuid')
var fs = require('fs')
var koaBody = require('koa-body')
var path = require('path')

// var userHelper = require('../dbhelper/userHelper')
import userHelper from '../dbhelper/userHelper'
import { resolve } from 'path';
import { rejects } from 'assert';

/**
 * 创建文章草稿
 * @param {Function} next          [description]
 * @yield {[type]}   [description]
 */
exports.createArticle = async (ctx, next) => {
  var body = ctx.request.body;
  var user = await User.findOne({
	  accessToken: ctx.request.headers.authorization
  }).exec()
  var Author = {
    name: user.name,
    _id: user._id,
  };
  var article = await Article.findOne({
    _id: ctx.request.body._id
  }).exec()

  if(!article) {
    article = new Article({
      Author: Author,
      type: ctx.request.body.type,
      articleName: ctx.request.body.articleName,
      isDraft: ctx.request.body.isDraft,
      content: ctx.request.body.content,
    })
  } else {
    var fields = 'type,articleName,isDraft,content'.split(',');

    fields.forEach(function(field) {
      if (body[field]) {
        article[field] = xss(body[field].trim())
      }
    })
  }

  try {
    article = await article.save()
    ctx.body = {
      data: article,
      success: true
    }
  }
  catch (e) {
    ctx.body = {
      success: false
    }

    return next
  }
}

/**
 * 注册新用户
 * @param {Function} next          [description]
 * @yield {[type]}   [description]
 */
exports.signup = async (ctx, next) => {
	var phoneNumber = xss(ctx.request.body.phoneNumber.trim())
	var user = await User.findOne({
	  phoneNumber: phoneNumber
	}).exec()
  console.log(user)
	
	var verifyCode = Math.floor(Math.random()*10000+1)
	if (!user) {
	  var accessToken = uuid.v4()

	  user = new User({
      name: ctx.request.body.name,
      mail: ctx.request.body.mail,
      password: ctx.request.body.password,
	    avatar: 'http://upload-images.jianshu.io/upload_images/5307186-eda1b28e54a4d48e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240',
	    phoneNumber: xss(phoneNumber),
	    verifyCode: verifyCode,
	    accessToken: accessToken
	  })
	}
	else {
	  user.verifyCode = verifyCode
	}

	try {
    user = await user.save()
    ctx.body = {
      data: user,
      success: true
    }
  }
  catch (e) {
    ctx.body = {
      success: false
    }

    return next
  }

}

/**
 * 登录
 * @param {Function} next          [description]
 * @yield {[type]}   [description]
 */
exports.login = async (ctx, next) => {
	var userName = ctx.request.body.userName
	var user = await User.findOne(
    {
	    $or: [{ mail: userName}, {phoneNumber: userName}]
    },
  ).exec()
  console.log('user', user)
  var accessToken = uuid.v4()
	if (!user) {
	  ctx.body = {
      success: false,
      errorMessage: '用户不存在',
    }
	}
	else if(user.password != ctx.request.body.password ) {
	  ctx.body = {
      success: false,
      errorMessage: '用户密码错误',
    }
	} else {
    try {
      user.verified = true;
      user.accessToken = accessToken;
      user = await user.save()
      ctx.body = {
        data: user,
        success: true
      }
    }
    catch (e) {
      ctx.body = {
        success: false,
        errorMessage: e.message,
      }
  
      return next
    }
  }

	

}

/**
 * 查询当前用户信息
 * @param {Function} next          [description]
 * @yield {[type]}   [description]
 */
exports.current = async (ctx, next) => {
	var user = await User.findOne({
	  accessToken: ctx.request.headers.authorization
	}).exec()
	if (!user) {
	  ctx.body = {
      success: false,
      errorMessage: 'token失效，请重新登录',
    }
	}
	 else {
    ctx.body = {
      data: user,
      success: true,
      errorMessage: '登录成功',
    }
  }
}

/**
 * 更新用户信息操作
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.update = async (ctx, next) => {
  var body = ctx.request.body
  var user = await User.findOne({
	  accessToken: ctx.request.headers.authorization
	}).exec()
  var fields = 'name,mail,phoneNumber,avatar'.split(',')

  fields.forEach(function(field) {
    if (body[field]) {
      user[field] = xss(body[field].trim())
    }
  })

  user = await user.save()

  ctx.body = {
    success: true,
    data: {
      mail: user.mail,
      name: user.name,
      accessToken: user.accessToken,
      avatar: user.avatar,
      age: user.age,
      breed: user.breed,
      gender: user.gender,
      _id: user._id
    }
  }
}
exports.getAlllUsers = async (ctx, next) => {
  var body = ctx.request.query || {};
  var pageIndex = body.pageIndex * 1;
  var pageSize = body.pageSize * 1;
  var total = await User.find().count();
  var users = await User.find().limit(pageSize).skip((pageIndex - 1) * pageSize);

  ctx.body = {
    success: true,
    data: {
      list: users,
      pagination: {
        pageIndex,
        pageSize,
        total: total,
      }
    }
  }
  
}
// UploadAvatar
exports.UploadAvatar = async (ctx, next) => {
  console.log('ctx.request',ctx.request)
  // var user = await User.findOne({
	//   accessToken: ctx.request.headers.authorization
	// }).exec()
  const file = ctx.request.files.file;
  const reader=fs.createReadStream(file.path);
  var filePath = path.join(__dirname, '../../', '/public/avatars')
  // let filePath=__dirname+"/static/upload";
  let fileResource=filePath+`/${file.name}`;
  // user.avatar = filePath+`/${file.name}`;
  // user = await user.save();
  if(!fs.existsSync(filePath)){  //判断staic/upload文件夹是否存在，如果不存在就新建一个

    fs.mkdir(filePath,(err)=>{
    
    if(err){
    
    throw new Error(err)
    
    }else{
    
    let upstream=fs.createWriteStream(fileResource);
    
    reader.pipe(upstream);
    
    ctx.response.body={
      success: true,
      data: {
        url:`/avatars/${file.name}`
      }
    }
    
    }
    
    })
    
    }else{
    
    let upstream=fs.createWriteStream(fileResource)
    
    reader.pipe(upstream);
    
    ctx.response.body={
      success: true,
      data: {
        url:`/avatars/${file.name}`
      }
    }
    
    }
  
}


/**
 * 数据库接口测试
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.users = async (ctx, next) => {
  var data = await userHelper.findAllUsers()
  // var obj = await userHelper.findByPhoneNumber({phoneNumber : '13525584568'})
  // console.log('obj=====================================>'+obj)
  
  ctx.body = {
    success: true,
    data
  }
}
exports.addUser = async (ctx, next) => {
  var user = new User({
      mail: '614401332@qq.com',
      avatar: 'http://ip.example.com/u/xxx.png',
      phoneNumber: xss('13800138000'),
      verifyCode: '5896',
      accessToken: uuid.v4()
    })
  var user2 =  await userHelper.addUser(user)
  if(user2){
    ctx.body = {
      success: true,
      data : user2
    }
  }
}
exports.deleteUser = async (ctx, next) => {
  const phoneNumber = xss(ctx.request.body.phoneNumber.trim())
  console.log(phoneNumber)
  var data  = await userHelper.deleteUser({phoneNumber})
  ctx.body = {
    success: true,
    data
  }
}