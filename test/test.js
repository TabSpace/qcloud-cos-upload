const $fs = require('fs');
const $path = require('path');
const $rp = require('request-promise');
const $assert = require('power-assert');
const $mocha = require('mocha');
const $upload = require('../index');
const $config = require('./config');

const {
	describe,
	it,
	before
} = $mocha;

const timestamp = Date.now();
const testLocalPath = $path.resolve(__dirname, '../temp/test.js');
const domain = `${$config.Bucket}-${$config.AppId}.coscd.myqcloud.com`;
const perfix = 'temp/tabspace';

const testKey = `${perfix}/test.js`;
const testCosPath = `http://${domain}/${perfix}/test.js`;

const overwriteKey = `${perfix}/test-overwrite.js`;
const overwriteCosPath = `http://${domain}/${perfix}/test-overwrite.js`;

const timestampKey = `${perfix}/test-${timestamp}.js`;
const timestampCosPath = `http://${domain}/${perfix}/test-${timestamp}.js`;

$fs.writeFileSync(testLocalPath, `console.log(${timestamp});\n`, 'utf8');

describe('config', () => {
	it('config exists', () => {
		const proplist = [
			'AppId',
			'SecretId',
			'SecretKey',
			'Bucket',
			'Region'
		];
		proplist.forEach(name => {
			$assert(typeof $config[name] === 'string');
			$assert(!!$config[name]);
		});
	});
});

describe('upload-not-overwrite', function () {
	this.timeout(20000);

	let uploadRs = null;
	let cosRs = null;

	before(done => {
		$upload({
			...$config,
			cdn: true,
			FilePath: testLocalPath,
			Key: testKey
		})
			.then(rs => {
				uploadRs = rs;
			})
			.then(() => new Promise(resolve => {
				setTimeout(resolve, 1000);
			}))
			.then(() => $rp(testCosPath))
			.then(rs => {
				cosRs = rs;
				setTimeout(done, 1000);
			})
			.catch(err => {
				console.error('upload-not-overwrite error:', err.message);
				done();
			});
	});

	it('NotOverwrite upload state should be succeed', () => {
		console.log('upload-not-overwrite uploadRs:', uploadRs);
		$assert(typeof uploadRs === 'object');
		$assert(!!uploadRs);
	});

	it('NotOverwrite upload should has return property cosPath', () => {
		$assert(typeof uploadRs.cosUrl === 'string');
		$assert(uploadRs.cosUrl.indexOf('coscd.myqcloud.com') >= 0);
	});

	it('NotOverwrite upload should has return property cdnPath', () => {
		$assert(typeof uploadRs.cdnUrl === 'string');
		$assert(uploadRs.cdnUrl.indexOf('file.myqcloud.com') >= 0);
	});

	it('NotOverwrite upload should has return property statusMsg', () => {
		$assert(uploadRs.statusMsg === 'Exists');
	});

	it('NotOverwrite upload should has return property url', () => {
		$assert(typeof uploadRs.url === 'string');
		$assert(uploadRs.url.indexOf('file.myqcloud.com') >= 0);
	});

	it('NotOverwrite target file should not be updated', () => {
		console.log('upload-not-overwrite cosRs', cosRs);
		$assert(typeof cosRs === 'string');
		$assert(cosRs.indexOf(timestamp) < 0);
	});
});

describe('upload-overwrite', function () {
	this.timeout(20000);

	let uploadRs = null;
	let cosRs = null;

	before(done => {
		$upload({
			...$config,
			cdn: 'test.myqcloud.com',
			overwrite: true,
			FilePath: testLocalPath,
			Key: overwriteKey
		})
			.then(rs => {
				uploadRs = rs;
			})
			.then(() => new Promise(resolve => {
				setTimeout(resolve, 1000);
			}))
			.then(() => $rp(overwriteCosPath))
			.then(rs => {
				cosRs = rs;
				setTimeout(done, 1000);
			})
			.catch(err => {
				console.error('upload-overwrite error:', err.message);
				done();
			});
	});

	it('Overwrite upload should succeed', () => {
		console.log('upload-overwrite uploadRs:', uploadRs);
		$assert(typeof uploadRs === 'object');
		$assert(!!uploadRs);
	});

	it('Overwrite upload should has return property cosPath', () => {
		$assert(typeof uploadRs.cosUrl === 'string');
		$assert(uploadRs.cosUrl.indexOf('coscd.myqcloud.com') >= 0);
	});

	it('Overwrite upload should has return property cdnPath', () => {
		$assert(typeof uploadRs.cdnUrl === 'string');
		$assert(uploadRs.cdnUrl.indexOf('test.myqcloud.com') >= 0);
	});

	it('Overwrite upload should has return property statusMsg', () => {
		$assert(uploadRs.statusMsg === 'Overwrite');
	});

	it('Overwrite upload should has return property url', () => {
		$assert(typeof uploadRs.url === 'string');
		$assert(uploadRs.url.indexOf('test.myqcloud.com') >= 0);
	});

	it('Overwrite file should be updated', () => {
		console.log('upload-overwrite cosRs', cosRs);
		$assert(typeof cosRs === 'string');
		$assert(cosRs.indexOf(timestamp) >= 0);
	});
});

describe('upload-fail', function () {
	this.timeout(20000);

	let uploadRs = null;
	before(done => {
		$upload({
			...$config,
			debug: true,
			FilePath: testLocalPath,
			Key: timestampKey,
			SecretKey: 'x'
		})
			.then(rs => {
				uploadRs = rs;
				done();
			})
			.catch(err => {
				console.error('upload-fail error:', err.message);
				done();
			});
	});

	it('upload-fail should be failed', () => {
		console.log('upload-fail uploadRs', uploadRs);
		$assert(uploadRs === null);
	});
});

describe('upload-new', function () {
	this.timeout(20000);

	let uploadRs = null;
	let cosRs = null;

	before(done => {
		$upload({
			...$config,
			FilePath: testLocalPath,
			Key: timestampKey
		})
			.then(rs => {
				uploadRs = rs;
			})
			.then(() => new Promise(resolve => {
				setTimeout(resolve, 1000);
			}))
			.then(() => $rp(timestampCosPath))
			.then(rs => {
				cosRs = rs;
				done();
			})
			.catch(err => {
				console.error('upload-new error:', err.message);
				done();
			});
	});

	it('New File upload should succeed', () => {
		console.log('upload-new uploadRs:', uploadRs);
		$assert(typeof uploadRs === 'object');
		$assert(!!uploadRs);
	});

	it('New File upload should has return property cosPath', () => {
		$assert(typeof uploadRs.cosUrl === 'string');
		$assert(uploadRs.cosUrl.indexOf('coscd.myqcloud.com') >= 0);
	});

	it('New File upload should not has return property cdnPath', () => {
		$assert(uploadRs.cdnUrl === undefined);
	});

	it('New File upload should has return property statusMsg', () => {
		$assert(uploadRs.statusMsg === 'Success');
	});

	it('New File upload should has return property url', () => {
		$assert(typeof uploadRs.url === 'string');
		$assert(uploadRs.url.indexOf('coscd.myqcloud.com') >= 0);
	});

	it('New file should be exists', () => {
		console.log('upload-new cosRs', cosRs);
		$assert(typeof cosRs === 'string');
		$assert(cosRs.indexOf(timestamp) >= 0);
	});
});
