const ZephyrService = require('../src/zephyr-service');
const Nock = require('nock');

describe(`ZephyrService`, () => {

    let options;

    beforeEach(() => {
        options = {
            zapiUrl: 'http://zephyr-url.com',
            jiraUser: 'jiraUser',
            jiraPassword: 'jiraPassword'
        }
    });


    describe(`createCycle()`, () => {

        it(`should create a cycle`, (done) => {

            let resultCycleId;

            const nock = Nock('http://zephyr-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/cycle')
                .reply(() => {
                    return { id: '999014' }
                });

            const zephyrService = ZephyrService(options);

            zephyrService.createCycle('name', (cycleId) => {
                resultCycleId = cycleId;
            })

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(resultCycleId).toEqual('999014');
                    done();
                });
            });

        });

        it(`should call the errorCallback if there was an error`, (done) => {

            const callbacks = {
                errorCallback: () => {}
            }

            spyOn(callbacks, 'errorCallback');

            const nock = Nock('http://zephyr-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/cycle')
                .reply(500)

            const zephyrService = ZephyrService(options);

            zephyrService.createCycle('name', () => {}, callbacks.errorCallback)

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(callbacks.errorCallback).toHaveBeenCalled();
                    done();
                });
            });

        });

    });


    describe(`createExecution()`, () => {

        it(`should create an execution`, (done) => {

            let resultExecutionId;

            const nock = Nock('http://zephyr-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/execution')
                .reply(() => {
                    return { '22243': {} }
                });

            const zephyrService = ZephyrService(options);

            zephyrService.createExecution('cycleId', 'issueId', (executionId) => {
                resultExecutionId = executionId;
            })

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(resultExecutionId).toEqual('22243');
                    done();
                });
            });

        });


        it(`should call the errorCallback if there was an error`, (done) => {

            const callbacks = {
                errorCallback: () => {}
            }

            spyOn(callbacks, 'errorCallback');

            const nock = Nock('http://zephyr-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/execution')
                .reply(500)

            const zephyrService = ZephyrService(options);

            zephyrService.createExecution('cycleId', 'issueId', () => {}, callbacks.errorCallback)

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(callbacks.errorCallback).toHaveBeenCalled();
                    done();
                });
            });

        });

    });


    describe(`getStepId()`, () => {

        it(`should create an execution`, (done) => {

            let resultStepId;

            const nock = Nock('http://zephyr-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/stepResult?executionId=72840')
                .reply(() => {
                    return [ {id: '3414', stepId: '25141'} ];
                });

            const zephyrService = ZephyrService(options);

            zephyrService.getStepId('72840', '25141', (stepId) => {
                resultStepId = stepId;
            })

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(resultStepId).toEqual('3414');
                    done();
                });
            });

        });


        it(`should call the errorCallback if there is no matching step`, (done) => {

            const callbacks = {
                errorCallback: () => {}
            }

            spyOn(callbacks, 'errorCallback');

            const nock = Nock('http://zephyr-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/stepResult?executionId=72840')
                .reply(() => {
                    return [ {id: '3333', stepId: '25141'} ];
                });

            const zephyrService = ZephyrService(options);

            zephyrService.getStepId('72840', 'wrong', () => {}, callbacks.errorCallback);

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(callbacks.errorCallback).toHaveBeenCalled();
                    done();
                });
            });

        });


        it(`should call the errorCallback if there was an error`, (done) => {

            const callbacks = {
                errorCallback: () => {}
            }

            spyOn(callbacks, 'errorCallback');

            const nock = Nock('http://zephyr-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/stepResult?executionId=72840')
                .reply(500)

            const zephyrService = ZephyrService(options);

            zephyrService.getStepId('72840', '25141', () => {}, callbacks.errorCallback);

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(callbacks.errorCallback).toHaveBeenCalled();
                    done();
                });
            });

        });

    });


    describe(`updateTestStep()`, () => {

        it(`should update a test step`, (done) => {

            const callbacks = {
                callback: () => {}
            }

            spyOn(callbacks, 'callback');

            const nock = Nock('http://zephyr-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .put('/stepResult/21441')
                .reply(() => {
                    return {}
                });

            const zephyrService = ZephyrService(options);

            zephyrService.updateTestStep('21441', '1', callbacks.callback);

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(callbacks.callback).toHaveBeenCalled();
                    done();
                });
            });

        });

    });


    describe(`updateExecution()`, () => {

        it(`should update a test step`, (done) => {

            const callbacks = {
                callback: () => {}
            }

            spyOn(callbacks, 'callback');

            const nock = Nock('http://zephyr-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .put('/execution/21441/execute')
                .reply(() => {
                    return {}
                });

            const zephyrService = ZephyrService(options);

            zephyrService.updateExecution('21441', '1', callbacks.callback);

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(callbacks.callback).toHaveBeenCalled();
                    done();
                });
            });

        });

    });


    describe(`addAttachmentBuffered()`, () => {

        it(`should update a test step`, (done) => {

            const callbacks = {
                callback: () => {}
            }

            spyOn(callbacks, 'callback');

            const nock = Nock('http://zephyr-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/attachment?entityId=21441&entityType=STEPRESULT')
                .reply(() => {
                    return {}
                });

            const zephyrService = ZephyrService(options);

            zephyrService.addAttachmentBuffered('21441', '1', callbacks.callback);

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(callbacks.callback).toHaveBeenCalled();
                    done();
                });
            });

        });

    });

});

