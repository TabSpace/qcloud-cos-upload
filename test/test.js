const $fs = require('fs');
const $path = require('path');
const $rp = require('request-promise');
const $chai = require('chai');
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
	it('config.AppId should be a string', () => {
		$chai.expect($config.AppId).to.be.a('string');
	});

	it('config.SecretId should be a string', () => {
		$chai.expect($config.SecretId).to.be.a('string');
	});

	it('config.SecretKey should be a string', () => {
		$chai.expect($config.SecretKey).to.be.a('string');
	});

	it('config.Bucket should be a string', () => {
		$chai.expect($config.Bucket).to.be.a('string');
	});

	it('config.Region should be a string', () => {
		$chai.expect($config.Region).to.be.a('string');
	});
});

describe('upload-not-overwrite', function () {
	this.timeout(5000);

	let uploadRs = null;
	let cosRs = null;

	before(done => {
		$upload(Object.assign({}, $config, {
			FilePath: testLocalPath,
			Key: testKey
		}))
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
		$chai.expect(uploadRs).to.be.an('object');
	});

	it('NotOverwrite target file should not be updated', () => {
		console.log('upload-not-overwrite cosRs', cosRs);
		$chai.expect(cosRs).to.be.a('string');
		$chai.expect(cosRs).to.not.include(timestamp);
	});
});

describe('upload-overwrite', function () {
	this.timeout(5000);

	let uploadRs = null;
	let cosRs = null;

	before(done => {
		$upload(Object.assign({}, $config, {
			overwrite: true,
			FilePath: testLocalPath,
			Key: overwriteKey
		}))
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
		$chai.expect(uploadRs).to.be.an('object');
	});

	it('Overwrite file should be updated', () => {
		console.log('upload-overwrite cosRs', cosRs);
		$chai.expect(cosRs).to.be.a('string');
		$chai.expect(cosRs).to.include(timestamp);
	});
});

describe('upload-new', function () {
	this.timeout(5000);

	let uploadRs = null;
	let cosRs = null;

	before(done => {
		$upload(Object.assign({}, $config, {
			FilePath: testLocalPath,
			Key: timestampKey
		}))
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
		$chai.expect(uploadRs).to.be.an('object');
	});

	it('New file should be exists', () => {
		console.log('upload-new cosRs', cosRs);
		$chai.expect(cosRs).to.be.a('string');
		$chai.expect(cosRs).to.include(timestamp);
	});
});

