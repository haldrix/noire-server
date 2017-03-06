'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Exiting = require('exiting');
var Config = require('../../lib/config');
var Manager = require('../../lib/manager');
var MockAuth = require('../fixtures/auth-plugin');

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
        port: 0,
    }],
    registrations: [{
        plugin: '../test/fixtures/auth-plugin'
    }, {
        plugin: './plugins/web'
    }, {
        plugin: 'vision'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

internals.users = [{
    'id': 0,
    'username': 'test',
    'email': 'test@gmail.com',
    'scope': 'user'
}, {
    'id': 1,
    'username': 'admin',
    'email': 'admin@gmail.com',
    'scope': 'admin'
}];


describe('Plugin: web', function() {

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

    it('returns the home view for non authenticaded users', function(done) {

        MockAuth.authenticate = false;
        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject(Config.paths.home, function(response) {

                MockAuth.authenticate = true;
                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                expect(response.request.auth.isAuthenticated).to.be.false();
                Manager.stop(done);
            });
        });
    });

    it('returns the home view for authenticaded users', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject({
                method: 'GET',
                url: Config.paths.home,
                credentials: internals.users[0]
            }, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                expect(response.request.auth.isAuthenticated).to.be.true();
                expect(response.request.auth.credentials.id).to.equal(internals.users[0].id);
                expect(response.request.auth.credentials.username).to.equal(internals.users[0].username);
                expect(response.request.auth.credentials.email).to.equal(internals.users[0].email);
                expect(response.request.auth.credentials.scope).to.equal(internals.users[0].scope);
                Manager.stop(done);

            });

        });
    });

    it('returns the home view for admin users', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject({
                method: 'GET',
                url: Config.paths.home,
                credentials: internals.users[1]
            }, function(response) {

                expect(internals.users[1].scope).to.equal('admin');
                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                expect(response.request.auth.isAuthenticated).to.be.true();
                expect(response.request.auth.credentials.id).to.equal(internals.users[1].id);
                expect(response.request.auth.credentials.username).to.equal(internals.users[1].username);
                expect(response.request.auth.credentials.email).to.equal(internals.users[1].email);
                expect(response.request.auth.credentials.scope).to.equal(internals.users[1].scope);
                Manager.stop(done);
            });

        });
    });

    it('returns the login view', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject(Config.paths.login, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                Manager.stop(done);
            });

        });
    });

    it('returns the admin page', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'GET',
                url: Config.prefixes.admin,
                credentials: {
                    scope: 'admin'
                },
            }, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                Manager.stop(done);
            });

        });
    });

    it('returns the user account page', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'GET',
                url: Config.prefixes.account,
                credentials: {
                    scope: 'user'
                },
            }, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                Manager.stop(done);
            });

        });
    });
});