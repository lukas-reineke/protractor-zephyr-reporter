const suiteStarted = require('../../src/zephyr-reporter-functions/suite-started');

describe(`suiteStarted()`, () => {

    let self;

    beforeEach(() => {
        self = {
            disabled: false,
            globals: {
                cycleId: '666'
            },
            zephyrService: {},
            onPrepareDefer: {
                fulfill: () => true,
            },
            onCompleteDefer: {
                fulfill: () => true,
            }
        }
    });


    it(`should do nothing if the reporter is disabled`, () => {

        const suite = {}

        self.disabled = true;

        suiteStarted.bind(self)(suite);

        expect(self.globals.executionId).toBeUndefined();

    });


    it(`should use the cycleId to create the execution`, () => {

        let result;

        const suite = {
            description: 'mock mock @9898'
        }

        self.zephyrService.createExecution = (cycleId, issueId, callback, errorCallback) => {
            result = cycleId;
        };

        suiteStarted.bind(self)(suite);

        expect(result).toEqual('666');

    });


    it(`should generate the issueId to create the execution`, () => {

        let result;

        const suite = {
            description: 'mock mock @9898'
        }

        self.zephyrService.createExecution = (cycleId, issueId, callback, errorCallback) => {
            result = issueId;
        };

        suiteStarted.bind(self)(suite);

        expect(result).toEqual('9898');

    });


    it(`should set the executionId after it created the execution`, () => {

        const suite = {
            description: 'mock mock @9898'
        }

        self.zephyrService.createExecution = (cycleId, issueId, callback, errorCallback) => {
            callback('7777');
        };

        suiteStarted.bind(self)(suite);

        expect(self.globals.executionId).toEqual('7777');

    });


    it(`should disable the reporter if it can't create an execution`, () => {

        spyOn(self.onPrepareDefer, 'fulfill');
        spyOn(self.onCompleteDefer, 'fulfill');

        const suite = {
            description: 'mock mock @9898'
        }

        self.zephyrService.createExecution = (cycleId, issueId, callback, errorCallback) => {
            errorCallback('forced error');
        };

        suiteStarted.bind(self)(suite);

        expect(self.onPrepareDefer.fulfill).toHaveBeenCalled();
        expect(self.onCompleteDefer.fulfill).toHaveBeenCalled();
        expect(self.disabled).toBe(true);

    });

});

