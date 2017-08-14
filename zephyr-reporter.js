const fs = require('fs');
const streamBuffers = require('stream-buffers');

const ZephyrReporter = (options, onPrepareDefer, onCompleteDefer, browser) => {

    let disabled = false;
    let ZephyrService;
    let buildImageName;
    let globals = {
        executionId: '',
        cycleId: '',
        status: '1'
    };
    let specPromises = [];
    let specPromisesResolve = {};

    if (
        !options.hasOwnProperty('projectId') ||
        !options.hasOwnProperty('jiraPassword') ||
        !options.hasOwnProperty('jiraUser') ||
        !options.hasOwnProperty('zapiUrl') ||
        !options.hasOwnProperty('jiraUrl')
    ) {
        disabled = true;
        console.error('required options for ZephyrReporter are missing, not doing anything.');
    } else if (options.disabled) {
        disabled = true;
        console.info('ZephyrReporter is disabled, not doing anything.');
    } else {
        ZephyrService = require('./zephyr-service')(options);

        buildImageName = (specId) => {
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

        browser.getProcessedConfig()
            .then((config) => {

                const name = config.capabilities.name || 'no name';

                ZephyrService.createCycle(name, (cycleId) => {
                    globals.cycleId = cycleId;
                    onPrepareDefer.fulfill();
                }, (error) => {
                    disabled = true;
                    console.error(error);
                });

            })
            .catch((error) => {
                disabled = true;
                console.error(error);
            });
    }

    this.suiteStarted = (suite) => {
        if (!disabled) {
            const issueId = suite.description.split('@')[1];
            ZephyrService.createExecution(globals.cycleId, issueId, (executionId) => {
                globals.executionId = executionId;
            }, (error) => {
                disabled = true;
                console.error(error);
            });
        }
    };

    this.specStarted = (spec) => {
        if (!disabled) {
            specPromises.push(new Promise((resolve) => {
                specPromisesResolve[spec.id] = resolve;
            }));
        }
    };

    this.specDone = (spec) => {
        if (!disabled) {
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
                        }, (error) => {
                            console.error(error);
                            resolve();
                        });
                    }));

                    if ((specStatus === '2' && options.screenshot !== 'never') || options.screenshot === 'always') {

                        specDonePromises.push(new Promise((resolve) => {
                            browser.takeScreenshot()
                                .then((png) => {
                                    let imageStreamBuffer = new streamBuffers.WritableStreamBuffer({
                                        initialSize: (100 * 1024),
                                        incrementAmount: (10 * 1024)
                                    });
                                    imageStreamBuffer.write(new Buffer(png, 'base64'));
                                    ZephyrService.addAttachmentBuffered(stepId, imageStreamBuffer.getContents(), () => {
                                        resolve();
                                    }, (error) => {
                                        console.error(error);
                                        resolve();
                                    });
                                })
                                .catch((error) => {
                                    console.error(error);
                                    resolve();
                                });
                        }));

                        if (browser.params.imageComparison && fs.existsSync(buildImageName(specId))) {
                            specDonePromises.push(new Promise((resolve) => {
                                ZephyrService.addAttachment(stepId, buildImageName(specId), () => {
                                    resolve();
                                }, (error) => {
                                    console.error(error);
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

                }, (error) => {
                    console.error(error);
                    specPromisesResolve[spec.id]();
                });
            }
        }
    };

    this.suiteDone = () => {
        if (!disabled) {
            Promise.all(specPromises).then(() => {
                ZephyrService.updateExecution(
                    globals.executionId,
                    globals.status,
                    () => {
                        onCompleteDefer.fulfill();
                    },
                    (error) => {
                        console.error(error);
                        onCompleteDefer.fulfill();
                    }
                );
            });
        }
    };

    return this;
};

module.exports = ZephyrReporter;

