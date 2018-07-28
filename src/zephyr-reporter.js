
const ZephyrReporter = (options = {}, onPrepareDefer, onCompleteDefer, browser) => {

    this.fs = require('fs');
    this.streamBuffers = require('stream-buffers');

    this.disabled = !!options.disabled;
    this.onPrepareDefer = onPrepareDefer;
    this.onCompleteDefer = onCompleteDefer;
    this.browser = browser;

    const requiredOptions = [
        'projectId',
        'zapiUrl',
        'jiraUrl'
    ]
        .filter(() => !this.disabled)
        .filter((option) => !options.hasOwnProperty(option))
        .forEach((option) => {
            console.error(`required option '${option}' for ZephyrReporter is missing.`);
            this.disabled = true;
        });

    if (this.disabled) {
        console.info('ZephyrReporter is disabled, not doing anything.');
        if (this.onPrepareDefer.resolve) {
            this.onPrepareDefer.resolve();
        } else {
            this.onPrepareDefer.fulfill();
        }

        if (this.onCompleteDefer.resolve) {
            this.onCompleteDefer.resolve();
        } else {
            this.onCompleteDefer.fulfill();
        }
        return;
    }

    this.options = {
        ...options,
        zapiUrl: options.zapiUrl.replace(/\/+$/, ''),
        jiraUrl: options.jiraUrl.replace(/\/+$/, '')
    }

    this.zephyrService = require('./zephyr-service')(this.options);
    this.globals = {
        executionId: '',
        cycleId: '',
        status: '1'
    };
    this.specPromises = [];
    this.specPromisesResolve = {};

    require('./zephyr-reporter-functions/create-cycle').bind(this)();

    this.suiteStarted = require('./zephyr-reporter-functions/suite-started').bind(this);

    this.specStarted = require('./zephyr-reporter-functions/spec-started').bind(this);

    this.specDone = require('./zephyr-reporter-functions/spec-done').bind(this);

    this.suiteDone = require('./zephyr-reporter-functions/suite-done').bind(this);

    return this;
};

module.exports = ZephyrReporter;

