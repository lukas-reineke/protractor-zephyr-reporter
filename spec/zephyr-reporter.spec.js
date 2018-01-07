const ZephyrReporter = require('../src/zephyr-reporter');
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
            },
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
            zapiUrl: 'http://zapi-url.com',
            jiraUrl: 'http://jira-url.com'
        }, onPrepareDefer, onCompleteDefer, browser);

        expect(zephyrReporter).toBeUndefined();
        expect(onPrepareDefer.fulfill).toHaveBeenCalled();
        expect(onCompleteDefer.fulfill).toHaveBeenCalled();
    });


    it(`should not do anything if it is disabled`, () => {

        spyOn(onPrepareDefer, 'fulfill');
        spyOn(onCompleteDefer, 'fulfill');

        const zephyrReporter = ZephyrReporter({
            projectId: 'mock',
            zapiUrl: 'http://zapi-url.com',
            jiraUrl: 'http://jira-url.com',
            disabled: true
        }, onPrepareDefer, onCompleteDefer, browser);

        expect(zephyrReporter).toBeUndefined();
        expect(onPrepareDefer.fulfill).toHaveBeenCalled();
        expect(onCompleteDefer.fulfill).toHaveBeenCalled();
    });


    it(`should create a cycle if all required options are met`, (done) => {

        spyOn(onPrepareDefer, 'fulfill');

        let result;
        const dateRegex = /\d\/\w{3}\/\d/;

        const nock = Nock('http://zapi-url.com')
            .defaultReplyHeaders({
                'Content-Type': 'application/json'
            })
            .post('/cycle')
            .reply((path, res) => {
                result = res;
                return { id: '1212' };
            });

        const zephyrReporter = ZephyrReporter({
            projectId: 'mock',
            zapiUrl: 'http://zapi-url.com',
            jiraUrl: 'http://jira-url.com'
        }, onPrepareDefer, onCompleteDefer, browser);

        nock.on('replied', () => {
            setTimeout(() => {
                expect(zephyrReporter).toBeDefined();
                expect(onPrepareDefer.fulfill).toHaveBeenCalled();
                expect(result.name).toEqual('mock');
                expect(result.projectId).toEqual('mock');
                expect(result.versionId).toEqual(-1);
                expect(result.sprintId).toEqual(-1);
                expect(dateRegex.test(result.startDate)).toBeTruthy();
                expect(dateRegex.test(result.endDate)).toBeTruthy();
                done();
            });
        });

    });

});

