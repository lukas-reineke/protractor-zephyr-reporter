
const buildImageName = (specId) => {
    let imageName = './';
    imageName += this.browser.params.imageComparison.diffFolder;
    imageName += '/';
    imageName += specId;
    imageName += '-';
    imageName += this.browser.params.imageComparison.browserName;
    imageName += '-';
    imageName += this.browser.params.imageComparison.browserWidth;
    imageName += 'x';
    imageName += this.browser.params.imageComparison.browserHeight;
    imageName += '-dpr-';
    imageName += this.browser.params.imageComparison.devicePixelRatio;
    imageName += '.png';
    return imageName;
};

module.exports = function(spec) {

    if (this.disabled) {
        return;
    }

    if (spec.status === 'disabled') {
        this.specPromisesResolve[spec.id]();
        return;
    }

    const specId = spec.description.split('@')[1];

    const specDonePromises = [];

    let specStatus = '1';
    if (spec.status !== 'passed') {
        specStatus = '2';
        this.globals.status = '2';
    }

    this.zephyrService.getStepId(this.globals.executionId, specId, (stepId) => {

        specDonePromises.push(new Promise((resolve) => {
            this.zephyrService.updateTestStep(stepId, specStatus, () => {
                resolve();
            }, (error) => {
                console.error(error);
                resolve();
            });
        }));

        if ((specStatus === '2' && this.options.screenshot !== 'never') || this.options.screenshot === 'always') {

            specDonePromises.push(new Promise((resolve) => {
                this.browser.takeScreenshot()
                    .then((png) => {
                        const imageStreamBuffer = new this.streamBuffers.WritableStreamBuffer({
                            initialSize: (100 * 1024),
                            incrementAmount: (10 * 1024)
                        });
                        imageStreamBuffer.write(new Buffer(png, 'base64'));
                        this.zephyrService.addAttachmentBuffered(stepId, imageStreamBuffer.getContents(), () => {
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

            if (this.browser.params.imageComparison && this.fs.existsSync(buildImageName(specId))) {
                specDonePromises.push(new Promise((resolve) => {
                    this.zephyrService.addAttachment(stepId, buildImageName(specId), () => {
                        resolve();
                    }, (error) => {
                        console.error(error);
                        resolve();
                    });
                }));
            }

            Promise.all(specDonePromises).then(() => {
                this.specPromisesResolve[spec.id]();
            });

        } else {
            this.specPromisesResolve[spec.id]();
        }

    }, (error) => {
        console.error(error);
        this.specPromisesResolve[spec.id]();
    });

}

