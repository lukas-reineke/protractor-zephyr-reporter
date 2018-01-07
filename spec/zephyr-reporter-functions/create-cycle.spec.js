const createCycle = require('../../src/zephyr-reporter-functions/create-cycle');

describe(`createCycle()`, () => {

    let self;

    beforeEach(() => {
        self = {
            browser: {},
            zephyrService: {},
            globals: {},
            onPrepareDefer: {
                fulfill: () => true,
            },
            onCompleteDefer: {
                fulfill: () => true,
            },
            disabled: false
        }
    });


    it(`should disabled the reporter if it can't get the browser config`, (done) => {

        spyOn(self.onPrepareDefer, 'fulfill');
        spyOn(self.onCompleteDefer, 'fulfill');

        self.browser.getProcessedConfig = () => new Promise((resolve, reject) => {
            reject('forced error');
        });

        createCycle.bind(self)();

        setTimeout(() => {
            expect(self.onPrepareDefer.fulfill).toHaveBeenCalled();
            expect(self.onCompleteDefer.fulfill).toHaveBeenCalled();
            expect(self.disabled).toBe(true);
            done();
        })

    });


    it(`should disabled the reporter if it can't create a cycle`, (done) => {

        spyOn(self.onPrepareDefer, 'fulfill');
        spyOn(self.onCompleteDefer, 'fulfill');

        self.browser.getProcessedConfig = () => new Promise((resolve, reject) => {
            resolve({
                capabilities: { name: 'mock' }
            });
        });

        self.zephyrService.createCycle = (name, callback, errorCallback) => {
            errorCallback('forced error');
        };

        createCycle.bind(self)();

        setTimeout(() => {
            expect(self.onPrepareDefer.fulfill).toHaveBeenCalled();
            expect(self.onCompleteDefer.fulfill).toHaveBeenCalled();
            expect(self.disabled).toBe(true);
            done();
        })

    });


    it(`should use the browser name to create a cycle`, (done) => {

        let result;

        self.browser.getProcessedConfig = () => new Promise((resolve, reject) => {
            resolve({
                capabilities: { name: 'mock' }
            });
        });

        self.zephyrService.createCycle = (name, callback, errorCallback) => {
            result = name;
            callback(1234);
        };

        createCycle.bind(self)();

        setTimeout(() => {
            expect(result).toEqual('mock');
            done();
        })

    });


    it(`should use no-name as a default, if the browser dosen't have a name`, (done) => {

        let result;

        self.browser.getProcessedConfig = () => new Promise((resolve, reject) => {
            resolve({
                capabilities: {}
            });
        });

        self.zephyrService.createCycle = (name, callback, errorCallback) => {
            result = name;
            callback(1234);
        };

        createCycle.bind(self)();

        setTimeout(() => {
            expect(result).toEqual('no name');
            done();
        })

    });


    it(`should set the cycleId and resolve onPrepareDefer if it created the cycle`, (done) => {

        spyOn(self.onPrepareDefer, 'fulfill');

        self.browser.getProcessedConfig = () => new Promise((resolve, reject) => {
            resolve({
                capabilities: { name: 'mock' }
            });
        });

        self.zephyrService.createCycle = (name, callback, errorCallback) => {
            callback(1234);
        };

        createCycle.bind(self)();

        setTimeout(() => {
            expect(self.onPrepareDefer.fulfill).toHaveBeenCalled();
            expect(self.globals.cycleId).toEqual(1234);
            done();
        })

    });

});

