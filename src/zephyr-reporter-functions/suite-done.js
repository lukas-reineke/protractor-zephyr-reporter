
module.exports = function() {

    if (this.disabled) {
        return;
    }

    Promise.all(this.specPromises).then(() => {
        this.zephyrService.updateExecution(
            this.globals.executionId,
            this.globals.status,
            () => {
                if (this.onCompleteDefer.resolve) {
                    this.onCompleteDefer.resolve();
                } else {
                    this.onCompleteDefer.fulfill();
                }
            },
            (error) => {
                console.error(error);
                if (this.onCompleteDefer.resolve) {
                    this.onCompleteDefer.resolve();
                } else {
                    this.onCompleteDefer.fulfill();
                }
            }
        );
    });

}

