'use strict'

// 定义第三方服务：比如七牛云、第三方手机短信验证码等服务
var qiniu = require('qiniu')

exports.getUploadToken = async (ctx, next) => {
  var accessKey = 'kWOr3q0RHUvGEtDiDr2ImvKEgYRhC6YWi4dABtns';
  var secretKey = '7QqDyUsp_OmE35_Br0an62s7JSpoWbU9oeuJR2Dm';
  var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

  var options = {
    scope: bucket,
  };
  var putPolicy = new qiniu.rs.PutPolicy(options);
  var uploadToken = putPolicy.uploadToken(mac);

  ctx.body = {
    success: true,
    data: {
      uploadToken
    }
  }
}
