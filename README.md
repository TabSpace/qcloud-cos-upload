# qcloud-cos-upload

[![npm version](https://badge.fury.io/js/qcloud-cos-upload.svg)](https://www.npmjs.com/package/qcloud-cos-upload)

上传单个文件到腾讯云COS服务，用于静态文件上传

适配腾讯云官方 COS Nodejs SDK（XML API） [cos-nodejs-sdk-v5](https://github.com/tencentyun/cos-nodejs-sdk-v5)

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

## Release History

 * 2018-05-08 v1.0.5 上传文件超过一定大小(progressData.total > 1024*1024)，才显示上传进度信息
 * 2018-05-08 v1.0.3 参数配置遵循腾讯云规范，避免警告呈现
 * 2018-05-07 v1.0.2 更新腾讯云sdk依赖
 * 2018-01-02 v1.0.1 锁死依赖版本号，避免腾讯云api不稳定的影响
 * 2017-11-08 v1.0.0 发布第一个正式版
