# qcloud-cos-upload

[![npm version](https://badge.fury.io/js/qcloud-cos-upload.svg)](https://www.npmjs.com/package/qcloud-cos-upload)
[![Build Status](https://travis-ci.org/TabSpace/qcloud-cos-upload.svg?branch=master)](https://travis-ci.org/TabSpace/qcloud-cos-upload)

上传单个文件到腾讯云COS服务，用于静态文件上传

[releases and changelog](https://github.com/TabSpace/qcloud-cos-upload/releases)

## Tips

适配腾讯云官方 COS Nodejs SDK（XML API） [cos-nodejs-sdk-v5](https://github.com/tencentyun/cos-nodejs-sdk-v5)

批量上传文件参见 [gulp-qcloud-cos-upload](https://github.com/TabSpace/gulp-qcloud-cos-upload)

为安全起见，建议为每个存储桶提供独立的子账号，使用子账号的 SecretId 和 SecretKey 来上传文件。

[创建子账号](https://cloud.tencent.com/document/product/634/14453)

在存储桶配置的`权限管理`页卡配置`存储桶访问权限`和`Policy权限设置`，提供子账号的访问权限。

## Getting Started

安装:

```shell
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
});
```
