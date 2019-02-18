# qcloud-cos-upload

[![npm version](https://badge.fury.io/js/qcloud-cos-upload.svg)](https://www.npmjs.com/package/qcloud-cos-upload)
[![Build Status](https://travis-ci.org/TabSpace/qcloud-cos-upload.svg?branch=master)](https://travis-ci.org/TabSpace/qcloud-cos-upload)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

上传单个文件到腾讯云COS服务，用于静态文件上传。

[releases and changelog](https://github.com/TabSpace/qcloud-cos-upload/releases)

## Tips

适配腾讯云官方 COS Nodejs SDK（XML API） [cos-nodejs-sdk-v5](https://github.com/tencentyun/cos-nodejs-sdk-v5)

批量上传文件参见 [gulp-qcloud-cos-upload](https://github.com/TabSpace/gulp-qcloud-cos-upload)

为安全起见，建议为每个存储桶提供独立的子账号，使用子账号的 SecretId 和 SecretKey 来上传文件。

[创建子账号](https://cloud.tencent.com/document/product/634/14453)

在存储桶配置的`权限管理`页卡配置`存储桶访问权限`和`Policy权限设置`，提供子账号的访问权限。

## Getting Started

安装:

```bash
npm i qcloud-cos-upload
```

选项配置参见 [腾讯云存储说明文档](https://cloud.tencent.com/document/product/436/8629)

使用:

```script
const upload = require('qcloud-cos-upload');

upload({
  // 是否开启调试模式，默认为 false，调试模式下，报错时输出详细错误信息
  debug: false,
  // 是否在控制台打印上传日志，默认为 true
  log: true,
  // 是否允许文件覆盖，默认为 false
  overwrite: false,
  // 为 true 则输出文件路径为腾讯云默认 CDN 地址。为具体域名，则替换腾讯云默认 CDN 域名。
  cdn: '',
  // 在腾讯云申请的 AppId
  AppId: '1000000000',
  // 配置腾讯云 COS 服务所需的 SecretId
  SecretId: 'AKIDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  // 配置腾讯云 COS 服务所需的 SecretKey
  SecretKey: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  // COS服务配置的存储桶名称
  Bucket: 'static',
  // 地域名称
  Region: 'ap-chengdu',
  // 要上传的本地文件路径
  FilePath: './1.zip',
  // 文件在存储桶中的路径
  Key: '1.zip'
}).then(rs => {
  // 线上路径
  console.info(rs.url);
  // 为 true 表明线上文件已存在
  console.info(rs.isExists);
  // 为 true 表明进行了覆盖
  console.info(rs.overwrited);
  // 为 true 表明已进行了上传
  console.info(rs.uploaded);
  // 文件在对象存储的线上访问路径
  console.info(rs.cosUrl);
  // 文件在 CDN 的线上访问路径，如果没有配置 cdn 选项则为 undefined
  console.info(rs.cdnUrl);
  // 如果进行了上传，可以通过 uploadData 取得详细上传信息
  console.info(rs.uploadData);
});
```
