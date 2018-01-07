
module.exports = function(suite) {

    if (this.disabled) {
        return;
    }

    const issueId = suite.description.split('@')[1];

    this.zephyrService.createExecution(this.globals.cycleId, issueId, (executionId) => {
        this.globals.executionId = executionId;
    }, (error) => {
        console.error(error);
        this.onPrepareDefer.fulfill();
        this.onCompleteDefer.fulfill();
        this.disabled = true;
    });

}

