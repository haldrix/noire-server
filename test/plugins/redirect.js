'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Url = require('url');
var Exiting = require('exiting');
var Manager = require('../../lib/manager');
var Config = require('../../lib/config');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var before = lab.before;
var afterEach = lab.afterEach;
var it = lab.test;
var expect = Code.expect;

var internals = {};
internals.manifest = {
    connections: [{
        host: 'localhost',
        port: 0,
        labels: ['web']
    }, {
        host: 'localhost',
        port: 0,
        labels: ['web-tls'],
        tls: Config.tls
    }, {
        host: 'localhost',
        port: 0,
        labels: ['api'],
        tls: Config.tls
    }],
    registrations: [{
        plugin: '../test/fixtures/auth-plugin',
        options: {
            select: ['web', 'web-tls']
        }
    }, {
        plugin: './plugins/web',
        options: {
            select: ['web', 'web-tls'],
        }
    }, {
        plugin: './plugins/redirect',
        options: {
            select: ['web', 'web-tls']
        }
    }, {
        plugin: 'vision'
    }]
};

internals.webUrl = {
    protocol: 'http',
    slashes: true,
    hostname: Config.connections.web.host,
    port: Config.connections.web.port,
};

internals.webTlsUrl = {
    protocol: 'https',
    slashes: true,
    hostname: Config.connections.webTls.host,
    port: Config.connections.webTls.port,
};

internals.apiUrl = {
    protocol: 'https',
    slashes: true,
    hostname: Config.connections.api.host,
    port: Config.connections.api.port,
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: redirect', function() {

    before(function(done) {
        Exiting.reset();
        done();
    });

    afterEach(function(done) {

        // Manager might not be properly stopped when tests fail
        if (Manager.getState() === 'started') {
            Manager.stop(done);
        } else {
            done();
        }

    });

    it('http api requests redirected to https', function(done) {

        var redirectUrl = Url.format(internals.apiUrl) + Path.resolve(Config.prefixes.api, 'version');
        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var web = server.select('web');
            web.inject(Path.resolve(Config.prefixes.api, 'version'), function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                Manager.stop(done); // done() callback is required to end the test.

            });

        });

    });

    it('http admin requests redirected to https', function(done) {

        var redirectUrl = Url.format(internals.webTlsUrl) + Config.prefixes.admin;
        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var web = server.select('web');
            web.inject(Config.prefixes.admin, function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                Manager.stop(done); // done() callback is required to end the test.
            });

        });

    });

    it('http account requests redirected to https', function(done) {

        var redirectUrl = Url.format(internals.webTlsUrl) + Config.prefixes.account;
        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var web = server.select('web');
            web.inject(Config.prefixes.account, function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                Manager.stop(done); // done() callback is required to end the test.
            });

        });

    });

    it('http login requests redirected to https', function(done) {

        var redirectUrl = Url.format(internals.webTlsUrl) + Config.paths.login;
        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var web = server.select('web');
            web.inject(Config.paths.login, function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                Manager.stop(done); // done() callback is required to end the test.

            });

        });
    });

    it('http root request redirected to home', function(done) {

        var redirectUrl = Url.format(internals.webUrl) + '/home';
        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var web = server.select('web');
            web.inject('/', function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                Manager.stop(done); // done() callback is required to end the test.

            });

        });
    });

    it('https root request redirected to home', function(done) {

        var redirectUrl = Url.format(internals.webTlsUrl) + Config.paths.home;
        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var webTls = server.select('web-tls');
            webTls.inject('/', function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                Manager.stop(done); // done() callback is required to end the test.

            });

        });
    });

    it('https valid route', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var webTls = server.select('web-tls');
            webTls.inject(Config.paths.home, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                Manager.stop(done); // done() callback is required to end the test.

            });

        });
    });

});
