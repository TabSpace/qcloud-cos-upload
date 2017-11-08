const $fs = require('fs');
const $path = require('path');
const $rp = require('request-promise');
const $chai = require('chai');
const $mocha = require('mocha');
const $upload = require('../index');
const $config = require('../temp/config');

const {
	describe,
	it,
	before
} = $mocha;

const timestamp = Date.now();
const noopLocalPath = $path.resolve(__dirname, '../temp/noop.js');
const domain = `${$config.Bucket}-${$config.AppId}.coscd.myqcloud.com`;
const perfix = 'temp/tabspace';

const noopKey = `${perfix}/noop.js`;
const noopCosPath = `http://${domain}/${perfix}/noop.js`;

const overwriteKey = `${perfix}/noop-overwrite.js`;
const overwriteCosPath = `http://${domain}/${perfix}/noop-overwrite.js`;

const timestampKey = `${perfix}/noop-${timestamp}.js`;
const timestampCosPath = `http://${domain}/${perfix}/noop-${timestamp}.js`;

$fs.writeFileSync(noopLocalPath, `console.log(${timestamp});\n`, 'utf8');

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
			file: noopLocalPath,
			Key: noopKey
		})).then(rs => {
			uploadRs = rs;
			return $rp(noopCosPath);
		}).then(rs => {
			cosRs = rs;
			done();
		}).catch(err => {
			console.error('upload-not-overwrite error:', err.message);
			done();
		});
	});

	it('Upload should succeed', () => {
		console.log('upload-not-overwrite uploadRs:', uploadRs);
		$chai.expect(uploadRs).to.be.an('object');
	});

	it('File should be exists', () => {
		console.log('upload-not-overwrite cosRs', cosRs);
		$chai.expect(cosRs).to.be.an('object');
	});
});

describe('upload-overwrite', function () {
	this.timeout(5000);

	let uploadRs = null;
	let cosRs = null;

	before(done => {
		$upload(Object.assign({}, $config, {
			file: noopLocalPath,
			Key: overwriteKey
		})).then(rs => {
			uploadRs = rs;
			return $rp(overwriteCosPath);
		}).then(rs => {
			cosRs = rs;
			done();
		}).catch(err => {
			console.error('upload-overwrite error:', err.message);
			done();
		});
	});

	it('Upload should succeed', () => {
		console.log('upload-overwrite uploadRs:', uploadRs);
		$chai.expect(uploadRs).to.be.an('object');
	});

	it('File should be exists', () => {
		console.log('upload-overwrite cosRs', cosRs);
		$chai.expect(cosRs).to.be.an('object');
	});
});

describe('upload-new', function () {
	this.timeout(5000);

	let uploadRs = null;
	let cosRs = null;

	before(done => {
		$upload(Object.assign({}, $config, {
			file: noopLocalPath,
			Key: timestampKey
		})).then(rs => {
			uploadRs = rs;
			return $rp(timestampCosPath);
		}).then(rs => {
			cosRs = rs;
			done();
		}).catch(err => {
			console.error('upload-new error:', err.message);
			done();
		});
	});

	it('Upload should succeed', () => {
		console.log('upload-new uploadRs:', uploadRs);
		$chai.expect(uploadRs).to.be.an('object');
	});

	it('File should be exists', () => {
		console.log('upload-new cosRs', cosRs);
		$chai.expect(cosRs).to.be.an('object');
	});
});

