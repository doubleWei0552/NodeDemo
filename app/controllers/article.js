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
 * 查询当前用户信息
 * @param {Function} next          [description]
 * @yield {[type]}   [description]
 */
exports.deleteArticleById = async (ctx, next) => {
	var {id} = ctx.request.query;
	if (!id) {
	  ctx.body = {
      success: false,
      errorMessage: 'id不能为空',
    }
	}
	 else {
    await Article.remove({_id: id}, function(err) {
      if(err) {
        ctx.body = {
          success: false,
          errorMessage: err.message,
        }
      }else{
        ctx.body = {
          success: true,
        }
      }
      
    })
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
exports.getMyArticles = async (ctx, next) => {
  var body = ctx.request.query || {};
  var pageIndex = body.pageIndex * 1;
  var pageSize = body.pageSize * 1;
  var user = await User.findOne({
	  accessToken: ctx.request.headers.authorization
	}).exec()
  var total = await Article.find({'Author._id': user._id}).count();
  var articles = await Article.find({'Author._id': user._id}).limit(pageSize).skip((pageIndex - 1) * pageSize);

  ctx.body = {
    success: true,
    data: {
      list: articles,
      pagination: {
        pageIndex,
        pageSize,
        total: total,
      }
    }
  }
}

// 查看文章
exports.getArticleById = async (ctx, next) => {
  var {id} = ctx.request.query;
  if(!id) {
    ctx.body = {
      success: false,
      message: 'id不能为空',
    }
  }else {
    var article = await Article.findOne({'_id': id}).exec();
    if(!article) {
      ctx.body = {
        success: false,
        message: '文章不存在',
      }
    }else{
      ctx.body = {
        success: true,
        data: article,
      }
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