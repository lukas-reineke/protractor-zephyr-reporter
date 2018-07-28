
module.exports = function(suite) {

    if (this.disabled) {
        return;
    }

    const issueId = suite.description.split('@')[1];

    this.zephyrService.createExecution(this.globals.cycleId, issueId, (executionId) => {
        this.globals.executionId = executionId;
    }, (error) => {
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

