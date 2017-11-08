const $chalk = require('chalk');
const $cos = require('cos-nodejs-sdk-v5');
const $urljoin = require('url-join');

// console.log('getting acl');

// data: { GrantFullControl: '',
//   GrantWrite: '',
//   GrantRead: '',
//   ACL: 'default',
//   Owner:
//    { ID: 'qcs::cam::uin/3381845790:uin/3381845790',
//      DisplayName: 'qcs::cam::uin/3381845790:uin/3381845790' },
//   Grants: [ { Grantee: [Object], Permission: 'FULL_CONTROL' } ],
//   statusCode: 200,
//   headers:
//    { 'content-type': 'application/xml',
//      'content-length': '520',
//      connection: 'close',
//      date: 'Wed, 08 Nov 2017 06:28:20 GMT',
//      server: 'tencent-cos',
//      'x-cos-acl': 'default',
//      'x-cos-request-id': 'NWEwMmE0MDRfNGQ5ZTU4NjRfMjNkOF8zYzI3Ng==' } }
//      
// error: { error:
//    { Code: 'NoSuchKey',
//      Message: 'The specified key does not exist.',
//      Resource: 'ria-1252004079.cos.ap-chengdu.myqcloud.com/temp/noop1.js',
//      RequestId: 'NWEwMmE0MWRfMjNiMjU4NjRfNDJiZl8zMDdjMQ==',
//      TraceId: 'OGVmYzZiMmQzYjA2OWNhODk0NTRkMTBiOWVmMDAxODczNTBmNjMwZmQ0MTZkMjg0NjlkNTYyNmY4ZTRkZTk0N2ZiYTAwYjg1MWZmZjM2YzZhZjBhNjU1ZGRiZjY0NzcwMmNjMTllMmNjN2I0ZDUzYjAxMzk4M2YyOTRkNWMwYTI=' },
//   statusCode: 404,
//   headers:
//    { 'content-type': 'application/xml',
//      'content-length': '473',
//      connection: 'close',
//      date: 'Wed, 08 Nov 2017 06:28:45 GMT',
//      server: 'tencent-cos',
//      'x-cos-request-id': 'NWEwMmE0MWRfMjNiMjU4NjRfNDJiZl8zMDdjMQ==',
//      'x-cos-trace-id': 'OGVmYzZiMmQzYjA2OWNhODk0NTRkMTBiOWVmMDAxODczNTBmNjMwZmQ0MTZkMjg0NjlkNTYyNmY4ZTRkZTk0N2ZiYTAwYjg1MWZmZjM2YzZhZjBhNjU1ZGRiZjY0NzcwMmNjMTllMmNjN2I0ZDUzYjAxMzk4M2YyOTRkNWMwYTI=' } }



// console.log('start upload');

// start upload
// task ready: 4d36bd63-ccaa-c393-bb8a-814263558517
// onProgress: { loaded: 44, total: 44, speed: 106.02, percent: 1 }
// data: { Location: 'ria-1252004079.cn-southwest.myqcloud.com/temp/noop.js',
//   Bucket: 'ria',
//   Key: 'temp/noop.js',
//   ETag: '"e0d4567457dc546ac3e902c17f9fefcd-1"',
//   statusCode: 200,
//   headers:
//    { 'content-type': 'application/xml',
//      'transfer-encoding': 'chunked',
//      connection: 'close',
//      date: 'Wed, 08 Nov 2017 03:14:35 GMT',
//      server: 'tencent-cos',
//      'x-cos-request-id': 'NWEwMjc2OWJfNWNiMjU4NjRfMjdlY18zNTk3Zg==' } }



const cosCache = {};

const requestParam = {
	AppId: '',
	SecretId: '',
	SecretKey: '',
	Bucket: '',
	Region: '',
	Key: '',
	FilePath: ''
};

const uploadFile = (conf, cos) => {
	let progressIndex = 0;
	cos.sliceUploadFile({
		Bucket: conf.Bucket,
		Region: conf.Region,
		Key: conf.Key,
		FilePath: conf.FilePath,
		onProgress: progressData => {
			if (progressIndex > 0) {
				if (progressIndex === 1) {
					console.log($chalk.gray(`Uploading: ${conf.cosPath}`));
				}
				if (progressData) {
					let percent = (Math.floor(progressData.percent * 100) || 0) + '%';
					console.log($chalk.gray(`total:${progressData.total}, loaded:${progressData.loaded}, speed:${progressData.speed}, percent:${percent}`));
				}
			}
			progressIndex++;
		}
	}, (err, data) => {
		if (err) {
			if (err.error && err.error.Message) {
				conf.error(err.error.Message, err);
			} else {
				conf.error('Upload error', err);
			}
		} else if (data && data.statusCode === 200) {
			if (conf.isOverwriting) {
				console.log($chalk.cyan(`Overwrite: ${conf.cosPath}`));
			} else {
				console.log($chalk.green(`Success: ${conf.cosPath}`));
			}
			conf.resolve({
				path: conf.cosPath
			});
		} else {
			conf.error('Upload error', data);
		}
	});
};

const checkAcl = (conf, cos) => {
	cos.getObjectAcl({
		Bucket: conf.Bucket,
		Region: conf.Region,
		Key: conf.Key
	}, (err, data) => {
		if (err) {
			if (err.statusCode === 404) {
				uploadFile(conf, cos);
			} else if (err.error && err.error.Message) {
				conf.error(err.error.Message, err);
			} else {
				conf.error('Check ACL error', err);
			}
		} else if (data && data.statusCode === 200) {
			if (conf.overwrite) {
				conf.isOverwriting = true;
				uploadFile(conf, cos);
			} else {
				if (conf.log) {
					console.log($chalk.gray(`Exists: ${conf.cosPath}`));
				}
				conf.resolve({
					isExists: true,
					path: conf.cosPath
				});
			}
		} else {
			conf.error('Check ACL error', data);
		}
	});
};

const upload = options => {
	options = options || {};

	let conf = Object.assign({
		debug: false,
		log: true,
		overwrite: false
	}, requestParam, options);

	conf.domain = `${conf.Bucket}-${conf.AppId}.coscd.myqcloud.com`;
	conf.cosPath = $urljoin(`http://${conf.domain}`, conf.Key);

	return new Promise((resolve, reject) => {
		conf.resolve = resolve;
		conf.reject = reject;

		conf.error = (msg, err) => {
			if (conf.log) {
				console.log($chalk.red(`Error: [${conf.Key}] ${msg}`));
			}
			if (conf.debug && err) {
				console.error($chalk.red('Error Detail:'));
				console.error(err);
			}
			reject(new Error(msg));
		};

		Object.keys(requestParam).forEach(key => {
			if (!conf[key]) {
				conf.error(`Need param: ${key}`);
			}
		});

		let cos = cosCache[conf.AppId];
		if (!cos) {
			cos = new $cos({
				AppId: conf.AppId,
				SecretId: conf.SecretId,
				SecretKey: conf.SecretKey
			});
			cosCache[conf.AppId] = cos;
		}

		checkAcl(conf, cos);
	});
};

module.exports = upload;

