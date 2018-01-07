const JiraService = require('../src/jira-service');
const Nock = require('nock');

describe(`JiraService`, () => {

    let options;

    beforeEach(() => {
        options = {
            jiraUrl: 'http://jira-url.com',
            boardId: '8921',
            version: '1',
            jiraUser: 'jiraUser',
            jiraPassword: 'jiraPassword'
        }
    });


    describe(`getActiveSprintId()`, () => {

        it(`should get the active sprint id`, (done) => {

            let resultSprintId;

            const nock = Nock('http://jira-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/board/8921/sprint?state=active')
                .reply(() => {
                    return {
                        values: [{
                            id: '1244421'
                        }]
                    }
                });

            const jiraService = JiraService(options);

            jiraService.getActiveSprintId().then((sprintId) => {
                resultSprintId = sprintId;
            })

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(resultSprintId).toEqual('1244421');
                    done();
                });
            });

        });


        it(`should return -1 if there is no active sprint`, (done) => {

            let resultSprintId;

            const nock = Nock('http://jira-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/board/8921/sprint?state=active')
                .reply(() => {
                    return { values: [] }
                });

            const jiraService = JiraService(options);

            jiraService.getActiveSprintId().then((sprintId) => {
                resultSprintId = sprintId;
            })

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(resultSprintId).toEqual('-1');
                    done();
                });
            });

        });


        it(`should return -1 if there was an error`, (done) => {

            let resultSprintId;

            const nock = Nock('http://jira-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/board/8921/sprint?state=active')
                .reply(500);

            const jiraService = JiraService(options);

            jiraService.getActiveSprintId().then((sprintId) => {
                resultSprintId = sprintId;
            })

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(resultSprintId).toEqual('-1');
                    done();
                });
            });

        });

    });


    describe(`getVersionId()`, () => {

        it(`should get the version id`, (done) => {

            let resultVersionId;

            const nock = Nock('http://jira-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/board/8921/version')
                .reply(() => {
                    return {
                        values: [
                            { name: '1', id: '5235' },
                            { name: 'mock', id: '362632' }
                        ]
                    }
                });

            const jiraService = JiraService(options);

            jiraService.getVersionId().then((versionId) => {
                resultVersionId = versionId;
            })

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(resultVersionId).toEqual('5235');
                    done();
                });
            });

        });


        it(`should return -1 if there is no version`, (done) => {

            let resultVersionId;

            const nock = Nock('http://jira-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/board/8921/version')
                .reply(() => {
                    return {
                        values: [
                            { name: '12', id: '5235' },
                            { name: 'mock', id: '362632' }
                        ]
                    }
                });

            const jiraService = JiraService(options);

            jiraService.getVersionId().then((versionId) => {
                resultVersionId = versionId;
            })

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(resultVersionId).toEqual('-1');
                    done();
                });
            });

        });


        it(`should return -1 if there is an error`, (done) => {

            let resultVersionId;

            const nock = Nock('http://jira-url.com')
                .defaultReplyHeaders({
                    'Content-Type': 'application/json'
                })
                .get('/board/8921/version')
                .reply(500)

            const jiraService = JiraService(options);

            jiraService.getVersionId().then((versionId) => {
                resultVersionId = versionId;
            })

            nock.on('replied', () => {
                setTimeout(() => {
                    expect(resultVersionId).toEqual('-1');
                    done();
                });
            });

        });

    });

});

