const fs = require('fs');
const streamBuffers = require('stream-buffers');

const ZephyrReporter = (options, onPrepareDefer, onCompleteDefer, browser) => {

    const ZephyrService = require('./zephyr-service')(options);

    const buildImageName = (specId) => {
        let imageName = './';
        imageName += browser.params.imageComparison.diffFolder;
        imageName += '/';
        imageName += specId;
        imageName += '-';
        imageName += browser.params.imageComparison.browserName;
        imageName += '-';
        imageName += browser.params.imageComparison.browserWidth;
        imageName += 'x';
        imageName += browser.params.imageComparison.browserHeight;
        imageName += '-dpr-';
        imageName += browser.params.imageComparison.devicePixelRatio;
        imageName += '.png';
        return imageName;
    };

    let globals = {
        executionId: '',
        cycleId: '',
        status: '1'
    };

    let specPromises = [];
    let specPromisesResolve = {};

    browser.getProcessedConfig()
        .then((config) => {

            const name = config.capabilities.name || 'no name';

            ZephyrService.createCycle(name, (cycleId) => {
                globals.cycleId = cycleId;
                onPrepareDefer.fulfill();
            });

        });

    this.suiteStarted = (suite) => {
        const issueId = suite.description.split('@')[1];
        ZephyrService.createExecution(globals.cycleId, issueId, (executionId) => {
            globals.executionId = executionId;
        });
    };

    this.specStarted = (spec) => {
        specPromises.push(new Promise((resolve) => {
            specPromisesResolve[spec.id] = resolve;
        }));
    };

    this.specDone = (spec) => {
        if (spec.status === 'disabled') {
            specPromisesResolve[spec.id]();
        } else {
            const specId = spec.description.split('@')[1];

            let specDonePromises = [];

            let specStatus = '1';
            if (spec.status !== 'passed') {
                specStatus = '2';
                globals.status = '2';
            }

            ZephyrService.getStepId(globals.executionId, specId, (stepId) => {

                specDonePromises.push(new Promise((resolve) => {
                    ZephyrService.updateTestStep(stepId, specStatus, () => {
                        resolve();
                    });
                }));

                if ((specStatus === '2' && options.screenshot !== 'never') || options.screenshot === 'always') {

                    specDonePromises.push(new Promise((resolve) => {
                        browser.takeScreenshot().then((png) => {
                            let imageStreamBuffer = new streamBuffers.WritableStreamBuffer({
                                initialSize: (100 * 1024),
                                incrementAmount: (10 * 1024)
                            });
                            imageStreamBuffer.write(new Buffer(png, 'base64'));
                            ZephyrService.addAttachmentBuffered(stepId, imageStreamBuffer.getContents(), () => {
                                resolve();
                            });
                        });
                    }));

                    if (browser.params.imageComparison && fs.existsSync(buildImageName(specId))) {
                        specDonePromises.push(new Promise((resolve) => {
                            ZephyrService.addAttachment(stepId, buildImageName(specId), () => {
                                resolve();
                            });
                        }));
                    }

                    Promise.all(specDonePromises).then(() => {
                        specPromisesResolve[spec.id]();
                    });

                } else {
                    specPromisesResolve[spec.id]();
                }

            });
        }
    };

    this.suiteDone = () => {
        ZephyrService.updateExecution(
            globals.executionId,
            globals.status,
            () => {
                Promise.all(specPromises).then(() => {
                    onCompleteDefer.fulfill();
                });
            }
        );
    };

    return this;
};

module.exports = ZephyrReporter;

