'use strict'

// 定义第三方服务：比如七牛云、第三方手机短信验证码等服务
var qiniu = require('qiniu')
const Busboy = require('busboy')
const path = require('path')
const fs = require('fs')




// exports.getUploadToken = async (ctx, next) => {
//   var accessKey = 'kWOr3q0RHUvGEtDiDr2ImvKEgYRhC6YWi4dABtns';
//   var secretKey = '7QqDyUsp_OmE35_Br0an62s7JSpoWbU9oeuJR2Dm';
//   var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  
//   var options = {
//     scope: 'pojwhifoa.bkt.clouddn.com',
//   };
//   var putPolicy = new qiniu.rs.PutPolicy(options);
//   console.log('qiniu')
//   var uploadToken = putPolicy.uploadToken(mac);
//   const config = new qiniu.conf.Config()
//   // 空间对应的机房
//   config.zone = qiniu.zone.Zone_z2
//   const localFile = filePath
//   const formUploader = new qiniu.form_up.FormUploader(config)
//   const putExtra = new qiniu.form_up.PutExtra()
//   // 文件上传
//   return new Promise((resolved, reject) => {
//     formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
//       if (respErr) {
//         reject(respErr)
//       }
//       if (respInfo.statusCode == 200) {
//         resolved(respBody)
//       } else {
//         resolved(respBody)
//       }
//     })
//   })
// }

// 写入目录
const mkdirsSync = (dirname) => {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
  return false
}

function getSuffix (fileName) {
  return fileName.split('.').pop()
}

// 重命名
function Rename (fileName) {
  return Math.random().toString(16).substr(2) + '.' + getSuffix(fileName)
}
// 删除文件
function removeTemImage (path) {
  fs.unlink(path, (err) => {
    if (err) {
      throw err
    }
  })
}

// 上传到本地服务器
function uploadFile (ctx, options) {
  const _emmiter = new Busboy({headers: ctx.req.headers})
  const fileType = options.fileType
  const filePath = path.join(options.path, fileType)
  const confirm = mkdirsSync(filePath)
  console.log('filePath', filePath)
  if (!confirm) {
    return
  }
  console.log('start uploading...')
  return new Promise((resolve, reject) => {
    _emmiter.on('file', function (fieldname, file, filename, encoding, mimetype) {
      const fileName = Rename(filename)
      const saveTo = path.join(path.join(filePath, fileName))
      file.pipe(fs.createWriteStream(saveTo))
      file.on('end', function () {
        resolve({
          imgPath: `/${fileType}/${fileName}`,
          imgKey: fileName
        })
      })
    })

    _emmiter.on('finish', function () {
      console.log('finished...')
    })

    _emmiter.on('error', function (err) {
      console.log('err...')
      reject(err)
    })

    ctx.req.pipe(_emmiter)
  })
}

// 上传到七牛
function upToQiniu (filePath, key) {
  const accessKey = 'kWOr3q0RHUvGEtDiDr2ImvKEgYRhC6YWi4dABtns'// 你的七牛的accessKey
  const secretKey = '7QqDyUsp_OmE35_Br0an62s7JSpoWbU9oeuJR2Dm' // 你的七牛的secretKey
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

  const options = {
    scope: 'pojwhifoa.bkt.clouddn.com' // 你的七牛存储对象
  }
  const putPolicy = new qiniu.rs.PutPolicy(options)
  console.log('putPolicy', putPolicy)
  const uploadToken = putPolicy.uploadToken(mac)

  const config = new qiniu.conf.Config()
  // 空间对应的机房
  config.zone = qiniu.zone.Zone_z0
  const localFile = filePath
  const formUploader = new qiniu.form_up.FormUploader(config)
  const putExtra = new qiniu.form_up.PutExtra()
  // 文件上传
  return new Promise((resolved, reject) => {
    formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
      if (respErr) {
        reject(respErr)
      }
      if (respInfo.statusCode == 200) {
        resolved(respBody)
      } else {
        resolved(respBody)
      }
    })
  })

}

exports.getUploadToken = async (ctx, next) => {
  // const serverPath = path.join(__dirname, './uploads/')
  // // 获取上存图片
  // console.log('serverPath', serverPath)
  // const result = await uploadFile(ctx, {
  //   fileType: 'album',
  //   path: serverPath
  // })
  const file = ctx.request.files.file;
  const reader=fs.createReadStream(file.path);
  let filePath=__dirname+"/static/upload";
  console.log('file', file)
  let fileResource=filePath+`/${file.name}`;
  // console.log('result', result)
  // const imgPath = path.join(serverPath, result.imgPath)
  // 上传到七牛
  const qiniu = await upToQiniu(filePath, fileResource)
  // 上存到七牛之后 删除原来的缓存图片
  removeTemImage(imgPath)
  ctx.body = {
    imgUrl: `http://pojwhifoa.bkt.clouddn.com/${qiniu.key}`
  }
  
}
