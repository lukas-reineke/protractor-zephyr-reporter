const specDone = require('../../src/zephyr-reporter-functions/spec-done');

describe(`specDone()`, () => {

    let self;

    beforeEach(() => {
        self = {
            browser: {
                params: {
                    imageComparison: false
                }
            },
            zephyrService: {
                getStepId: () => {}
            },
            globals: {
                executionId: '4447'
            },
            specPromisesResolve: {},
            disabled: false,
            status: 1,
            options: {},
            streamBuffers: require('stream-buffers'),
            fs: {}
        }
    });


    it(`should do nothing if the reporter is disabled`, () => {

        self.disabled = true;

        specDone.bind(self)();

    });


    it(`should resolve the spec if it is disabled`, () => {

        self.specPromisesResolve['7878'] = () => true;

        spyOn(self.specPromisesResolve, '7878');

        const spec = {
            status: 'disabled',
            id: '7878'
        }

        specDone.bind(self)(spec);

        expect(self.specPromisesResolve['7878']).toHaveBeenCalled();

    });


    it(`should update the global status if the spec failed`, () => {

        self.specPromisesResolve['7878'] = () => true;

        const spec = {
            status: 'failed',
            id: '7878',
            description: 'mock mock @3838'
        }

        specDone.bind(self)(spec);

        expect(self.globals.status).toEqual('2');

    });


    it(`should use the executionId to get the step ID`, () => {

        let result;

        self.zephyrService.getStepId = (executionId, specId, callback, errorCallback) => {
            result = executionId;
        };

        const spec = {
            status: 'failed',
            id: '7878',
            description: 'mock mock @3838'
        }

        specDone.bind(self)(spec);

        expect(result).toEqual('4447');

    });


    it(`should generate the specId to get the step ID`, () => {

        let result;

        self.zephyrService.getStepId = (executionId, specId, callback, errorCallback) => {
            result = specId;
        };

        const spec = {
            status: 'failed',
            id: '7878',
            description: 'mock mock @3838'
        }

        specDone.bind(self)(spec);

        expect(result).toEqual('3838');

    });


    it(`should resolve the spec if it can't get the step ID`, () => {

        self.specPromisesResolve['7878'] = () => true;

        spyOn(self.specPromisesResolve, '7878');

        self.zephyrService.getStepId = (executionId, specId, callback, errorCallback) => {
            errorCallback('forced error');
        };

        const spec = {
            status: 'failed',
            id: '7878',
            description: 'mock mock @3838'
        }

        specDone.bind(self)(spec);

        expect(self.specPromisesResolve['7878']).toHaveBeenCalled();

    });


    it(`should updated the test step with the new status and resolve the spec`, (done) => {

        let resultSatus;
        let resultStepId;

        self.specPromisesResolve['7878'] = () => true;
        self.options.screenshot = 'never';

        spyOn(self.specPromisesResolve, '7878');

        self.zephyrService.getStepId = (executionId, specId, callback, errorCallback) => {
            callback('0909');
        };

        self.zephyrService.updateTestStep = (stepId, specStatus, callback, errorCallback) => {
            resultStepId = stepId;
            resultSatus = specStatus;
            callback();
        };

        const spec = {
            status: 'passed',
            id: '7878',
            description: 'mock mock @3838'
        }

        specDone.bind(self)(spec);

        setTimeout(() => {
            expect(self.specPromisesResolve['7878']).toHaveBeenCalled();
            expect(resultSatus).toEqual('1');
            expect(resultStepId).toEqual('0909');
            done();
        });

    });


    it(`should attach a screenshot if the test failed`, (done) => {

        let resultStepId;
        let resultImg;

        self.specPromisesResolve['7878'] = () => true;

        spyOn(self.specPromisesResolve, '7878');

        self.zephyrService.getStepId = (executionId, specId, callback, errorCallback) => {
            callback('0909');
        };

        self.zephyrService.updateTestStep = (stepId, specStatus, callback, errorCallback) => {
            callback();
        };

        self.zephyrService.addAttachmentBuffered = (stepId, img, callback, errorCallback) => {
            resultStepId = stepId;
            resultImg = String(img);
            callback();
        };

        self.browser.takeScreenshot = () => new Promise((resolve) => {
            resolve('png');
        });

        const spec = {
            status: 'failed',
            id: '7878',
            description: 'mock mock @3838'
        }

        specDone.bind(self)(spec);

        setTimeout(() => {
            expect(resultStepId).toEqual('0909');
            expect(resultImg).toEqual('�x');
            expect(self.specPromisesResolve['7878']).toHaveBeenCalled();
            done();
        });

    });


    it(`should attach the diff image if it exists`, (done) => {

        let resultStepId;
        let resultImgPath;

        self.specPromisesResolve['7878'] = () => true;

        spyOn(self.specPromisesResolve, '7878');

        self.zephyrService.getStepId = (executionId, specId, callback, errorCallback) => {
            callback('0909');
        };

        self.zephyrService.updateTestStep = (stepId, specStatus, callback, errorCallback) => {
            callback();
        };

        self.zephyrService.addAttachmentBuffered = (stepId, img, callback, errorCallback) => {
            callback();
        };

        self.zephyrService.addAttachment = (stepId, imgPath, callback, errorCallback) => {
            resultStepId = stepId;
            resultImgPath = imgPath;
            callback();
        };

        self.browser.takeScreenshot = () => new Promise((resolve) => {
            resolve('png');
        });

        self.fs.existsSync = () => true;

        self.browser.params.imageComparison = {
            diffFolder: 'diffFolder',
            browserName: 'browserName',
            browserWidth: 'browserWidth',
            browserHeight: 'browserHeight',
            devicePixelRatio: 'devicePixelRatio'
        };

        self.options.screenshot = 'always';

        const spec = {
            status: 'passed',
            id: '7878',
            description: 'mock mock @3838'
        }

        specDone.bind(self)(spec);

        setTimeout(() => {
            expect(self.specPromisesResolve['7878']).toHaveBeenCalled();
            expect(resultStepId).toEqual('0909');
            expect(resultImgPath).toEqual('./diffFolder/3838-browserName-browserWidthxbrowserHeight-dpr-devicePixelRatio.png');
            done();
        });

    });


    it(`should resolve the promise if it can't take a screenshot`, (done) => {

        let resultStepId;
        let resultImg;

        self.specPromisesResolve['7878'] = () => true;

        spyOn(self.specPromisesResolve, '7878');

        self.zephyrService.getStepId = (executionId, specId, callback, errorCallback) => {
            callback('0909');
        };

        self.zephyrService.updateTestStep = (stepId, specStatus, callback, errorCallback) => {
            callback();
        };

        self.browser.takeScreenshot = () => new Promise((resolve, reject) => {
            reject('forced error');
        });

        const spec = {
            status: 'failed',
            id: '7878',
            description: 'mock mock @3838'
        }

        specDone.bind(self)(spec);

        setTimeout(() => {
            expect(self.specPromisesResolve['7878']).toHaveBeenCalled();
            done();
        });

    });


    it(`should resolve the promise if it can't attach the image`, (done) => {

        self.specPromisesResolve['7878'] = () => true;

        spyOn(self.specPromisesResolve, '7878');

        self.zephyrService.getStepId = (executionId, specId, callback, errorCallback) => {
            callback('0909');
        };

        self.zephyrService.updateTestStep = (stepId, specStatus, callback, errorCallback) => {
            callback();
        };

        self.zephyrService.addAttachmentBuffered = (stepId, img, callback, errorCallback) => {
            errorCallback('forced error');
        };

        self.browser.takeScreenshot = () => new Promise((resolve) => {
            resolve('png');
        });

        const spec = {
            status: 'failed',
            id: '7878',
            description: 'mock mock @3838'
        }

        specDone.bind(self)(spec);

        setTimeout(() => {
            expect(self.specPromisesResolve['7878']).toHaveBeenCalled();
            done();
        });

    });


    it(`should resolve the promise if it can't attach the diff image`, (done) => {

        self.specPromisesResolve['7878'] = () => true;

        spyOn(self.specPromisesResolve, '7878');

        self.zephyrService.getStepId = (executionId, specId, callback, errorCallback) => {
            callback('0909');
        };

        self.zephyrService.updateTestStep = (stepId, specStatus, callback, errorCallback) => {
            callback();
        };

        self.zephyrService.addAttachmentBuffered = (stepId, img, callback, errorCallback) => {
            callback();
        };

        self.zephyrService.addAttachment = (stepId, imgPath, callback, errorCallback) => {
            errorCallback('forced error');
        };

        self.browser.takeScreenshot = () => new Promise((resolve) => {
            resolve('png');
        });

        self.fs.existsSync = () => true;

        self.browser.params.imageComparison = {
            diffFolder: 'diffFolder',
            browserName: 'browserName',
            browserWidth: 'browserWidth',
            browserHeight: 'browserHeight',
            devicePixelRatio: 'devicePixelRatio'
        };

        self.options.screenshot = 'always';

        const spec = {
            status: 'passed',
            id: '7878',
            description: 'mock mock @3838'
        }

        specDone.bind(self)(spec);

        setTimeout(() => {
            expect(self.specPromisesResolve['7878']).toHaveBeenCalled();
            done();
        });

    });

});

