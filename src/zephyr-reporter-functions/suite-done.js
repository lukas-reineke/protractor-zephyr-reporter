
module.exports = function() {

    if (this.disabled) {
        return;
    }

    Promise.all(this.specPromises).then(() => {
        this.zephyrService.updateExecution(
            this.globals.executionId,
            this.globals.status,
            () => this.onCompleteDefer.fulfill(),
            (error) => {
                console.error(error);
                this.onCompleteDefer.fulfill();
            }
        );
    });

}

