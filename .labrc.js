module.exports = {
    verbose: true,
    debug: true,
    coverage: true,
    threshold: 90,
    lint: true,
    assert: 'code',
    'coverage-path': 'lib',
    'coverage-exclude': 'config',
    paths: [
        'test/error.js',
        'test/manager.js',
        'test/controllers',
        'test/models',
        'test/plugins',
        'test/services'
    ],
    globals: '__core-js_shared__' // https://github.com/tgriesser/knex/issues/1720
};
