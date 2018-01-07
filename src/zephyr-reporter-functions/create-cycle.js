
module.exports = function() {

    this.browser.getProcessedConfig()
        .then((config) => {

            const name = config.capabilities.name || 'no name';

            this.zephyrService.createCycle(name, (cycleId) => {
                this.globals.cycleId = cycleId;
                this.onPrepareDefer.fulfill();
            }, (error) => {
                console.error(error);
                this.onPrepareDefer.fulfill();
                this.onCompleteDefer.fulfill();
                this.disabled = true;
            });

        })
        .catch((error) => {
            console.error(error);
            this.onPrepareDefer.fulfill();
            this.onCompleteDefer.fulfill();
            this.disabled = true;
        });

}

