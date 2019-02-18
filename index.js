const $chalk = require('chalk');
const $cos = require('cos-nodejs-sdk-v5');
const $urljoin = require('url-join');

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

const SLICE_UPLOAD_FILE_SIZE = 1024 * 1024;

function showError(conf, msg, err) {
	console.log($chalk.red(`Error: [${conf.Key}] ${msg}`));
	if (conf.debug && err) {
		console.error($chalk.red('Error Detail:'));
		console.error(err);
	}
}

function uploadFile(conf, cos) {
	return new Promise((resolve, reject) => {
		let progressIndex = 0;
		cos.sliceUploadFile({
			Bucket: conf.Bucket,
			Region: conf.Region,
			Key: conf.Key,
			FilePath: conf.FilePath,
			onProgress: progressData => {
				if (progressIndex > 0 && progressData && progressData.total > SLICE_UPLOAD_FILE_SIZE) {
					if (conf.log && progressIndex === 1) {
						console.log($chalk.gray(`Uploading: ${conf.cosPath}`));
					}
					let percent = (Math.floor(progressData.percent * 100) || 0) + '%';
					if (conf.log) {
						console.log($chalk.gray(`total:${progressData.total}, loaded:${progressData.loaded}, speed:${progressData.speed}, percent:${percent}`));
					}
				}
				progressIndex++;
			}
		}, (err, data) => {
			let upErr = new Error('Upload error.');
			if (err) {
				upErr.detail = err;
				reject(upErr);
			} else if (data && data.statusCode === 200) {
				conf.uploadData = data;
				conf.uploaded = true;
				resolve(conf);
			} else {
				upErr.detail = data;
				reject(upErr);
			}
		});
	});
}

function checkAcl(conf, cos) {
	return new Promise((resolve, reject) => {
		cos.getObjectAcl({
			Bucket: conf.Bucket,
			Region: conf.Region,
			Key: conf.Key
		}, (err, data) => {
			let aclErr = new Error('Acl Error.');
			if (err) {
				aclErr.detail = err;
				reject(aclErr);
			} else if (data && data.statusCode === 200) {
				conf.isExists = true;
				resolve(conf);
			} else {
				aclErr.detail = data;
				reject(aclErr);
			}
		});
	});
}

function upload(options) {
	options = options || {};

	let conf = Object.assign({
		// 静态资源对应 cdn 域名，配置后，打印在控制台的日志自动替换域名显示
		// 配置为 true ，自动匹配腾讯云 cdn 域名
		cdn: '',
		// 是否开启调试模式，调试模式开启后会有额外log产生
		debug: false,
		// 是否在控制台输出日志
		log: true,
		// 是否允许覆盖文件
		overwrite: false
	}, requestParam, options);

	conf.domain = `${conf.Bucket}-${conf.AppId}.coscd.myqcloud.com`;
	conf.cosPath = $urljoin(`http://${conf.domain}`, conf.Key);

	if (conf.cdn === true) {
		let cdnDomain = `${conf.Bucket}-${conf.AppId}.file.myqcloud.com`;
		conf.cdnPath = $urljoin(`http://${cdnDomain}`, conf.Key);
	} else if (conf.cdn) {
		conf.cdnPath = $urljoin(`http://${conf.cdn}`, conf.Key);
	}
	if (conf.Bucket.indexOf('-') < 0) {
		conf.Bucket = conf.Bucket + '-' + conf.AppId;
	} else if (!conf.AppId) {
		conf.AppId = conf.Bucket.split('-')[1] || '';
	}

	let hasAllRequestParam = Object.keys(requestParam).every(key => {
		if (!conf[key]) {
			showError(conf, `Missing parameter: ${key}`);
		}
		return conf[key];
	});

	if (!hasAllRequestParam) {
		return Promise.reject(new Error('Missing parameter.'));
	}

	let cos = cosCache[conf.AppId];
	if (!cos) {
		// 官方提示：
		// AppId has been deprecated,
		// Please put it at the end of parameter Bucket
		// (E.g: "test-1250000000").
		// cos sdk 不再需要 AppId 作为参数
		cos = new $cos({
			SecretId: conf.SecretId,
			SecretKey: conf.SecretKey
		});
		cosCache[conf.AppId] = cos;
	}

	let pm = checkAcl(conf, cos)
		.then(spec => {
			if (spec.overwrite) {
				return uploadFile(spec, cos);
			} else {
				spec.isExists = true;
				return spec;
			}
		})
		.catch(err => {
			if (err.detail && err.detail.statusCode === 404) {
				return uploadFile(conf, cos);
			} else {
				return Promise.reject(err);
			}
		})
		.then(spec => {
			let fileUrl = spec.cosPath;
			if (spec.cdn && spec.cdnPath) {
				fileUrl = spec.cdnPath;
			}
			spec.url = fileUrl;

			let execMsg = '';
			if (spec.isExists) {
				if (spec.overwrite) {
					spec.statusMsg = 'Overwrite';
					execMsg = $chalk.cyan(`Overwrite: ${fileUrl}`);
					spec.overwrited = true;
				} else {
					spec.statusMsg = 'Exists';
					execMsg = $chalk.gray(`Exists: ${fileUrl}`);
				}
			} else {
				spec.statusMsg = 'Success';
				execMsg = $chalk.green(`Success: ${fileUrl}`);
			}
			spec.execMsg = execMsg;
			if (spec.log) {
				console.log(execMsg);
			}
			return spec;
		})
		.catch(err => {
			if (err) {
				if (err.detail && err.detail.error && err.detail.error.Message) {
					showError(conf, err.detail.error.Message, err);
				} else if (err.message) {
					showError(conf, err.message, err);
				}
			}
			return Promise.reject(err);
		});

	return pm;
}

module.exports = upload;

