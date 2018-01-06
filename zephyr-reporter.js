const fs = require('fs');
const streamBuffers = require('stream-buffers');

const ZephyrReporter = (options = [], onPrepareDefer, onCompleteDefer, browser) => {

    const requiredOptions = [
        'projectId',
        'zapiUrl',
        'jiraUrl'
    ];
    let disabled = !!options.disabled;

    if (disabled) {
        console.info('ZephyrReporter is disabled, not doing anything.');
        onPrepareDefer.fulfill();
        onCompleteDefer.fulfill();
        return;
    } else {
        requiredOptions.forEach((option) => {
            if (!options.hasOwnProperty(option)) {
                console.error(`required option '${option}' for ZephyrReporter is missing, not doing anything.`);
                onPrepareDefer.fulfill();
                onCompleteDefer.fulfill();
                disabled = true;
            }
        });
        if (disabled) {
            return;
        }
    }

    options.zapiUrl = options.zapiUrl.replace(/\/+$/, '');
    options.jiraUrl = options.jiraUrl.replace(/\/+$/, '');

    const ZephyrService = require('./zephyr-service')(options);
    const globals = {
        executionId: '',
        cycleId: '',
        status: '1'
    };
    const specPromises = [];
    const specPromisesResolve = {};
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

    browser.getProcessedConfig()
        .then((config) => {

            const name = config.capabilities.name || 'no name';

            ZephyrService.createCycle(name, (cycleId) => {
                globals.cycleId = cycleId;
                onPrepareDefer.fulfill();
            }, (error) => {
                console.error(error);
                onPrepareDefer.fulfill();
                onCompleteDefer.fulfill();
                disabled = true;
            });

        })
        .catch((error) => {
            console.error(error);
            onPrepareDefer.fulfill();
            onCompleteDefer.fulfill();
            disabled = true;
        });

    this.suiteStarted = (suite) => {
        if (disabled) {
            return;
        }

        const issueId = suite.description.split('@')[1];
        ZephyrService.createExecution(globals.cycleId, issueId, (executionId) => {
            globals.executionId = executionId;
        }, (error) => {
            console.error(error);
            onPrepareDefer.fulfill();
            onCompleteDefer.fulfill();
            disabled = true;
        });
    };

    this.specStarted = (spec) => {
        if (disabled) {
            return;
        }

        specPromises.push(new Promise((resolve) => {
            specPromisesResolve[spec.id] = resolve;
        }));
    };

    this.specDone = (spec) => {
        if (disabled) {
            return;
        }

        if (spec.status === 'disabled') {
            specPromisesResolve[spec.id]();
            return;
        }

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
    };

    this.suiteDone = () => {
        if (disabled) {
            return;
        }

        Promise.all(specPromises).then(() => {
            ZephyrService.updateExecution(
                globals.executionId,
                globals.status,
                () => onCompleteDefer.fulfill(),
                (error) => {
                    console.error(error);
                    onCompleteDefer.fulfill();
                }
            );
        });
    };

    return this;
};

module.exports = ZephyrReporter;

