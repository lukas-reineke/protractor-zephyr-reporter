const ZephyrReporter = require('../src/zephyr-reporter');
const Nock = require('nock');

describe(`ZephyrReporter`, () => {

    let browser;
    let onPrepareDefer;
    let onCompleteDefer;

    beforeEach(() => {
        browser = {
            getProcessedConfig: () => {
                return new Promise((resolve) => {
                    resolve({
                        capabilities: {
                            name: 'mock'
                        }
                    });
                });
            },
            takeScreenshot: () => {
                return new Promise((resolve) => {
                    resolve('11');
                });
            },
            params: {
                diffFolder: 'diffFolder',
                browserName: 'browserName',
                browserWidth: 'browserWidth',
                browserHeight: 'browserHeight',
            }
        };
        onPrepareDefer = {
            fulfill: () => true
        };
        onCompleteDefer = {
            fulfill: () => true
        };
    });


    it(`should handle empty config files`, () => {

        spyOn(onPrepareDefer, 'fulfill');
        spyOn(onCompleteDefer, 'fulfill');

        const zephyrReporter = ZephyrReporter({}, onPrepareDefer, onCompleteDefer, browser);

        expect(zephyrReporter).toBeUndefined();
        expect(onPrepareDefer.fulfill).toHaveBeenCalled();
        expect(onCompleteDefer.fulfill).toHaveBeenCalled();
    });


    it(`should handle missing required options`, () => {

        spyOn(onPrepareDefer, 'fulfill');
        spyOn(onCompleteDefer, 'fulfill');

        const zephyrReporter = ZephyrReporter({
            zapiUrl: 'http://zapi-url.com',
            jiraUrl: 'http://jira-url.com'
        }, onPrepareDefer, onCompleteDefer, browser);

        expect(zephyrReporter).toBeUndefined();
        expect(onPrepareDefer.fulfill).toHaveBeenCalled();
        expect(onCompleteDefer.fulfill).toHaveBeenCalled();
    });


    it(`should not do anything if it is disabled`, () => {

        spyOn(onPrepareDefer, 'fulfill');
        spyOn(onCompleteDefer, 'fulfill');

        const zephyrReporter = ZephyrReporter({
            projectId: 'mock',
            zapiUrl: 'http://zapi-url.com',
            jiraUrl: 'http://jira-url.com',
            disabled: true
        }, onPrepareDefer, onCompleteDefer, browser);

        expect(zephyrReporter).toBeUndefined();
        expect(onPrepareDefer.fulfill).toHaveBeenCalled();
        expect(onCompleteDefer.fulfill).toHaveBeenCalled();
    });


    it(`should return a function if all required options are met`, (done) => {

        spyOn(onPrepareDefer, 'fulfill');

        let result;
        const dateRegex = /\d\/\w{3}\/\d/;

        const nock = Nock('http://zapi-url.com')
            .defaultReplyHeaders({
                'Content-Type': 'application/json'
            })
            .post('/cycle')
            .reply((path, res) => {
                result = res;
                return { id: '1212' };
            });

        const zephyrReporter = ZephyrReporter({
            projectId: 'mock',
            zapiUrl: 'http://zapi-url.com',
            jiraUrl: 'http://jira-url.com'
        }, onPrepareDefer, onCompleteDefer, browser);

        nock.on('replied', () => {
            setTimeout(() => {
                expect(zephyrReporter).toBeDefined();
                expect(onPrepareDefer.fulfill).toHaveBeenCalled();
                expect(result.name).toEqual('mock');
                expect(result.projectId).toEqual('mock');
                expect(result.versionId).toEqual(-1);
                expect(result.sprintId).toEqual(-1);
                expect(dateRegex.test(result.startDate)).toBeTruthy();
                expect(dateRegex.test(result.endDate)).toBeTruthy();
                done();
            });
        });

    });


    describe(`suiteStarted()`, () => {

        it(`should do nothing if the reporter is disabled`, (done) => {

            browser = {
                getProcessedConfig: () => {
                    return new Promise((resolve, reject) => {
                        reject('force error');
                    });
                }
            };

            const zephyrReporter = ZephyrReporter({
                projectId: 'mock',
                zapiUrl: 'http://zapi-url.com',
                jiraUrl: 'http://jira-url.com'
            }, onPrepareDefer, onCompleteDefer, browser);

            setTimeout(() => {
                expect(zephyrReporter.suiteStarted()).toBeUndefined();
                done();
            });

        });


        it(`should create an execution`, (done) => {

            let result;

            const nockCycle = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/cycle')
                .reply(() => {
                    return { id: '1212' };
                });

            const nockExecution = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/execution')
                .reply((path, res) => {
                    result = res
                    return { id: '1212' };
                });

            const zephyrReporter = ZephyrReporter({
                projectId: 'mock',
                zapiUrl: 'http://zapi-url.com',
                jiraUrl: 'http://jira-url.com'
            }, onPrepareDefer, onCompleteDefer, browser);

            nockCycle.on('replied', () => {
                setTimeout(() => {
                    zephyrReporter.suiteStarted({
                        description: 'mock@123'
                    })
                });
            });

            nockExecution.on('replied', () => {
                setTimeout(() => {
                    expect(result).toEqual({
                        cycleId: '1212',
                        issueId: '123',
                        projectId: 'mock'
                    });
                    done();
                });
            });

        });

    });


    describe(`specStarted()`, () => {

        it(`should do nothing if the reporter is disabled`, (done) => {

            browser = {
                getProcessedConfig: () => {
                    return new Promise((resolve, reject) => {
                        reject('force error');
                    });
                }
            };

            const zephyrReporter = ZephyrReporter({
                projectId: 'mock',
                zapiUrl: 'http://zapi-url.com',
                jiraUrl: 'http://jira-url.com'
            }, onPrepareDefer, onCompleteDefer, browser);

            setTimeout(() => {
                expect(zephyrReporter.specStarted()).toBeUndefined();
                done();
            });

        });

    });


    describe(`specDone()`, () => {

        it(`should do nothing if the reporter is disabled`, (done) => {

            browser = {
                getProcessedConfig: () => {
                    return new Promise((resolve, reject) => {
                        reject('force error');
                    });
                }
            };

            const zephyrReporter = ZephyrReporter({
                projectId: 'mock',
                zapiUrl: 'http://zapi-url.com',
                jiraUrl: 'http://jira-url.com'
            }, onPrepareDefer, onCompleteDefer, browser);

            setTimeout(() => {
                expect(zephyrReporter.specDone()).toBeUndefined();
                done();
            });

        });


        it(`should resolve disabled specs`, (done) => {

            const nockCycle = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/cycle')
                .reply(() => {
                    return { id: '1212' };
                });

            const nockExecution = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/execution')
                .reply((path, res) => {
                    result = res
                    return {'8888': 1};
                });

            const zephyrReporter = ZephyrReporter({
                projectId: 'mock',
                zapiUrl: 'http://zapi-url.com',
                jiraUrl: 'http://jira-url.com'
            }, onPrepareDefer, onCompleteDefer, browser);

            nockCycle.on('replied', () => {
                setTimeout(() => {
                    zephyrReporter.suiteStarted({
                        description: 'mock@123'
                    })
                });
            });

            nockExecution.on('replied', () => {
                setTimeout(() => {
                    const spec = {
                        id: 1,
                        status: 'disabled'
                    };
                    zephyrReporter.specStarted(spec);
                    zephyrReporter.specDone(spec);
                    done();
                });
            });

        });


        it(`should get the stepId and set the status of the step`, (done) => {

            let result;

            const nockCycle = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/cycle')
                .reply(() => {
                    return { id: '1212' };
                });

            const nockExecution = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/execution')
                .reply((path, res) => {
                    return {'8888': 1};
                });

            const nockStepId = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/stepResult?executionId=8888')
                .reply(() => {
                    return [{
                        stepId: '4545',
                        id: '99'
                    }];
                });

            const nockUpdateTestStep = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .put('/stepResult/99')
                .reply((path, res) => {
                    result = res;
                });

            const zephyrReporter = ZephyrReporter({
                projectId: 'mock',
                zapiUrl: 'http://zapi-url.com',
                jiraUrl: 'http://jira-url.com'
            }, onPrepareDefer, onCompleteDefer, browser);

            nockCycle.on('replied', () => {
                setTimeout(() => {
                    zephyrReporter.suiteStarted({
                        description: 'mock@123'
                    })
                });
            });

            nockExecution.on('replied', () => {
                setTimeout(() => {
                    const spec = {
                        id: 1,
                        status: 'passed',
                        description: 'mock@4545'
                    };
                    zephyrReporter.specStarted(spec);
                    zephyrReporter.specDone(spec);
                });
            });

            nockUpdateTestStep.on('replied', () => {
                setTimeout(() => {
                    expect(result).toEqual({ status: '1' });
                    done();
                });
            });

        });


        it(`should attach a screenshot if the spec faild`, (done) => {

            spyOn(browser, 'takeScreenshot').andCallThrough();

            let result;

            const nockCycle = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/cycle')
                .reply(() => {
                    return { id: '1212' };
                });

            const nockExecution = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/execution')
                .reply((path, res) => {
                    return {'8888': 1};
                });

            const nockStepId = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/stepResult?executionId=8888')
                .reply((path) => {
                    return [{
                        stepId: '4545',
                        id: '99'
                    }];
                });

            const nockUpdateTestStep = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .put('/stepResult/99')
                .reply((path, res) => {
                    result = res;
                });

            const nockAddAttachmentBuffered = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/attachment?entityId=99&entityType=STEPRESULT')
                .reply((path, res) => {
                    result = res;
                });

            const zephyrReporter = ZephyrReporter({
                projectId: 'mock',
                zapiUrl: 'http://zapi-url.com',
                jiraUrl: 'http://jira-url.com'
            }, onPrepareDefer, onCompleteDefer, browser);

            nockCycle.on('replied', () => {
                setTimeout(() => {
                    zephyrReporter.suiteStarted({
                        description: 'mock@123'
                    })
                });
            });

            nockExecution.on('replied', () => {
                setTimeout(() => {
                    const spec = {
                        id: 1,
                        status: 'failed',
                        description: 'mock@4545'
                    };
                    zephyrReporter.specStarted(spec);
                    zephyrReporter.specDone(spec);
                });
            });

            nockAddAttachmentBuffered.on('replied', () => {
                setTimeout(() => {
                    expect(browser.takeScreenshot).toHaveBeenCalled();
                    expect(result).toBeDefined();
                    done();
                });
            });

        });


    });


    describe(`suiteDone()`, () => {

        it(`should do nothing if the reporter is disabled`, (done) => {

            browser = {
                getProcessedConfig: () => {
                    return new Promise((resolve, reject) => {
                        reject('force error');
                    });
                }
            };

            const zephyrReporter = ZephyrReporter({
                projectId: 'mock',
                zapiUrl: 'http://zapi-url.com',
                jiraUrl: 'http://jira-url.com'
            }, onPrepareDefer, onCompleteDefer, browser);

            setTimeout(() => {
                expect(zephyrReporter.suiteDone()).toBeUndefined();
                done();
            });

        });


        it(`should update the execution`, (done) => {

            let result;

            const nockCycle = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/cycle')
                .reply(() => {
                    return { id: '1212' };
                });

            const nockExecution = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .post('/execution')
                .reply((path, res) => {
                    return {'8888': 1};
                });

            const nockStepId = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/stepResult?executionId=8888')
                .reply((path) => {
                    return [{
                        stepId: '4545',
                        id: '99'
                    }];
                });

            const nockUpdateTestStep = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .put('/stepResult/99')
                .reply((path, res) => {
                    result = res;
                });

            const nockUpdateExecution = Nock('http://zapi-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .put('/execution/8888/execute')
                .reply((path, res) => {
                    result = res;
                });

            const zephyrReporter = ZephyrReporter({
                projectId: 'mock',
                zapiUrl: 'http://zapi-url.com',
                jiraUrl: 'http://jira-url.com',
                screenshot: 'never'
            }, onPrepareDefer, onCompleteDefer, browser);

            nockCycle.on('replied', () => {
                setTimeout(() => {
                    zephyrReporter.suiteStarted({
                        description: 'mock@123'
                    })
                });
            });

            nockExecution.on('replied', () => {
                setTimeout(() => {
                    const spec = {
                        id: 1,
                        status: 'failed',
                        description: 'mock@4545'
                    };
                    zephyrReporter.specStarted(spec);
                    zephyrReporter.specDone(spec);
                });
            });

            nockUpdateTestStep.on('replied', () => {
                setTimeout(() => {
                    zephyrReporter.suiteDone();
                });
            });

            nockUpdateExecution.on('replied', () => {
                setTimeout(() => {
                    expect(result).toEqual({ status: '2' });
                    done();
                });
            });

        });
    });

});

