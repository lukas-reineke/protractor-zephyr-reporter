const suiteDone = require('../../src/zephyr-reporter-functions/suite-done');

describe(`suiteDone()`, () => {

    let self;

    beforeEach(() => {
        self = {
            disabled: false,
            globals: {
                executionId: '4343',
                status: '1'
            },
            zephyrService: {},
            onCompleteDefer: {
                fulfill: () => true,
            },
            specPromises: []
        }
    });


    it(`should do nothing if the reporter is disabled`, () => {

        self.disabled = true;

        suiteDone.bind(self)();

    });


    it(`should use the executionId and the status to update the execution`, (done) => {

        let resultExecutionId;
        let resultStatus;

        self.specPromises.push(new Promise((resolve) => {
            resolve();
        }))

        self.zephyrService.updateExecution = (executionId, status, callback, errorCallback) => {
            resultExecutionId = executionId;
            resultStatus = status;
            callback();
        };

        suiteDone.bind(self)();

        setTimeout(() => {
            expect(resultExecutionId).toEqual('4343');
            expect(resultStatus).toEqual('1');
            done();
        });
    });


    it(`should resolve the reporter after updating the execution`, (done) => {

        spyOn(self.onCompleteDefer, 'fulfill');

        self.specPromises.push(new Promise((resolve) => {
            resolve();
        }))

        self.zephyrService.updateExecution = (executionId, status, callback, errorCallback) => {
            callback();
        };

        suiteDone.bind(self)();

        setTimeout(() => {
            expect(self.onCompleteDefer.fulfill).toHaveBeenCalled();
            done();
        });
    });


    it(`should resolve the reporter even if there is an error`, (done) => {

        spyOn(self.onCompleteDefer, 'fulfill');

        self.specPromises.push(new Promise((resolve) => {
            resolve();
        }))

        self.zephyrService.updateExecution = (executionId, status, callback, errorCallback) => {
            errorCallback('forced error');
        };

        suiteDone.bind(self)();

        setTimeout(() => {
            expect(self.onCompleteDefer.fulfill).toHaveBeenCalled();
            done();
        });
    });

});

