
module.exports = function() {

    this.browser.getProcessedConfig()
        .then((config) => {

            const name = config.capabilities.name || 'no name';

            this.zephyrService.createCycle(name, (cycleId) => {
                this.globals.cycleId = cycleId;
                if (this.onPrepareDefer.resolve) {
                    this.onPrepareDefer.resolve();
                } else {
                    this.onPrepareDefer.fulfill();
                }

            }, (error) => {
                throw new Error(error);
            });

        })
        .catch((error) => {
            console.error(error);
            if (this.onPrepareDefer.resolve) {
                this.onPrepareDefer.resolve();
            } else {
                this.onPrepareDefer.fulfill();
            }

            if (this.onCompleteDefer.resolve) {
                this.onCompleteDefer.resolve();
            } else {
                this.onCompleteDefer.fulfill();
            }
            this.disabled = true;
        });

}

