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
				conf.resolve({
					isOverwrited: true,
					path: conf.cosPath
				});
			} else {
				console.log($chalk.green(`Success: ${conf.cosPath}`));
				conf.resolve({
					path: conf.cosPath
				});
			}
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
	if (conf.Bucket.indexOf('-') < 0) {
		conf.Bucket = conf.Bucket + '-' + conf.AppId;
	} else if (!conf.AppId) {
		conf.AppId = conf.Bucket.split('-')[1] || '';
	}

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

		let hasAllRequestParam = Object.keys(requestParam).every(key => {
			if (!conf[key]) {
				conf.error(`Need param: ${key}`);
			}
			return conf[key];
		});

		if (!hasAllRequestParam) { return; }

		let cos = cosCache[conf.AppId];
		if (!cos) {
			cos = new $cos({
				// 官方提示：
				// AppId has been deprecated,
				// Please put it at the end of parameter Bucket
				// (E.g: "test-1250000000").
				// AppId: conf.AppId,
				SecretId: conf.SecretId,
				SecretKey: conf.SecretKey
			});
			cosCache[conf.AppId] = cos;
		}

		checkAcl(conf, cos);
	});
};

module.exports = upload;

