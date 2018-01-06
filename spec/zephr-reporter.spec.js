const ZephyrReporter = require('../zephyr-reporter');
const Nock = require('nock');

describe(`ZephyrReporter`, () => {

    let browser;
    let onPrepareDefer;
    let onCompleteDefer;

    beforeEach(() => {
        browser = {
            getProcessedConfig: () => {
                return new Promise((resolve) => {
                    resolve({
                        capabilities: {
                            name: 'mock'
                        }
                    });
                });
            }
        };
        onPrepareDefer = {
            fulfill: () => true
        };
        onCompleteDefer = {
            fulfill: () => true
        };
    });


    it(`should handle empty config files`, () => {

        spyOn(onPrepareDefer, 'fulfill');
        spyOn(onCompleteDefer, 'fulfill');

        const zephyrReporter = ZephyrReporter({}, onPrepareDefer, onCompleteDefer, browser);

        expect(zephyrReporter).toBeUndefined();
        expect(onPrepareDefer.fulfill).toHaveBeenCalled();
        expect(onCompleteDefer.fulfill).toHaveBeenCalled();
    });

    it(`should handle missing required options`, () => {

        spyOn(onPrepareDefer, 'fulfill');
        spyOn(onCompleteDefer, 'fulfill');

        const zephyrReporter = ZephyrReporter({
            zapiUrl: 'mock',
            jiraUrl: 'mock'
        }, onPrepareDefer, onCompleteDefer, browser);

        expect(zephyrReporter).toBeUndefined();
        expect(onPrepareDefer.fulfill).toHaveBeenCalled();
        expect(onCompleteDefer.fulfill).toHaveBeenCalled();
    });

    it(`should not do anything if it is disabled`, () => {
        const zephyrReporter = ZephyrReporter({
            projectId: 'mock',
            zapiUrl: 'mock',
            jiraUrl: 'mock',
            disabled: true
        }, onPrepareDefer, onCompleteDefer, browser);

        expect(zephyrReporter).toBeUndefined();
    });

    it(`should return a function if all required options are met`, (done) => {

        spyOn(onPrepareDefer, 'fulfill');

        const nock = Nock('http://mock.com')
            .defaultReplyHeaders({
                'Content-Type': 'application/json'
            })
            .post('/cycle')
            .reply(() => {
                return { id: '1212' };
            });

        const zephyrReporter = ZephyrReporter({
            projectId: 'mock',
            zapiUrl: 'http://mock.com',
            jiraUrl: 'mock'
        }, onPrepareDefer, onCompleteDefer, browser);

        nock.on('replied', () => {
            setTimeout(() => {
                expect(zephyrReporter).toBeDefined();
                expect(onPrepareDefer.fulfill).toHaveBeenCalled();
                done();
            });
        });

    });

});

