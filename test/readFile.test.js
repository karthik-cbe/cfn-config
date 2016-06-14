var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var tape = require('tape');
var config = require('../index.js');
var readFile = config.readFile;
var localize = config.localize;

tape('readFile-local-valid', function(assert) {
    readFile({ template: __dirname + '/fixtures/local-valid.template', region: 'us-east-1' }, function(err, data) {
        assert.ifError(err);
        assert.deepEqual(data, {
            Parameters: {},
            Resources: {}
        });
        assert.end();
    });
});

tape('readFile-local-valid-js', function(assert) {
    readFile({ template:__dirname + '/fixtures/local-valid.template.js', region: 'us-east-1' }, function(err, data) {
        assert.ifError(err);
        assert.deepEqual(data, {
            Parameters: {},
            Resources: {}
        });
        assert.end();
    });
});

tape('readFile-async-local-valid-js', function(assert) {
    readFile({ template:__dirname + '/fixtures/local-async-valid.template.js', region: 'us-east-1' }, function(err, data) {
        assert.ifError(err);
        assert.deepEqual(data, {
            Parameters: {},
            Resources: {}
        });
        assert.end();
    });
});

tape('readFile-local-invalid', function(assert) {
    readFile({ template:__dirname + '/fixtures/local-invalid.template', region: 'us-east-1' }, function(err, data) {
        assert.equal(err.toString(), 'Error: Unable to parse file');
        assert.end();
    });
});

var origAWS = config.AWS;
tape('setup MockS3', function(assert) {
    config.AWS = { S3: MockS3 };
    function MockS3() {}
    MockS3.prototype.getObject = function(options, callback) {
        if (options.Key === 'valid.template') return callback(null, {
            Body: new Buffer(JSON.stringify({
                Parameters: {},
                Resources: {}
            }))
        });
        if (options.Key === 'invalid.template') return callback(null, {
            Body: new Buffer('this is not json')
        });
        return callback(new Error('Unsupported by mock'));
    };
    assert.end();
});

tape('readFile-s3', function(assert) {
    readFile({ template:'s3://mock-bucket/valid.template', region: 'us-east-1' }, function(err, data) {
        assert.ifError(err);
        assert.deepEqual(data, {
            Parameters: {},
            Resources: {}
        });
        assert.end();
    });
});

tape('readFile-s3', function(assert) {
    readFile({ template:'s3://mock-bucket/invalid.template', region: 'us-east-1' }, function(err, data) {
        assert.equal(err.toString(), 'Error: Unable to parse file');
        assert.end();
    });
});

tape('unset MockS3', function(assert) {
    config.AWS = origAWS;
    assert.end();
});
