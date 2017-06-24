const popsicle = require('popsicle');
const auth = require('popsicle-basic-auth');
const fs = require('fs');


const getDate = () => {
    const date = new Date();

    let response = (date.getDate());
    response += '/';
    response += date.toLocaleString('en-us', {month: 'short'});
    response += '/';
    response += date.getFullYear().toString().substring(2, 4);

    return response;
};


const ZephyrService = (options) => {

    const JiraService = require('./jira-service')(options);

    this.createCycle = (name, callback) => {

        let promises = ['getActiveSprintId'];

        if (options.version) {
            promises.push('getVersionId');
        }

        Promise.all(promises.map((func) => {
            return JiraService[func]();
        }))
            .then((response) => {
                popsicle.request({
                    method: 'POST',
                    url: options.zapiUrl + '/cycle',
                    body: {
                        name,
                        startDate: getDate(),
                        endDate: getDate(),
                        projectId: options.projectId,
                        versionId: response[1] || '-1',
                        sprintId: response[0]
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                    .use(popsicle.plugins.parse('json'))
                    .use(auth(options.jiraUser, options.jiraPassword))
                    .then((res) => {
                        callback(res.body.id);
                    })
                    .catch(function(error) {
                        console.error(error);
                    });
            });

    };

    this.createExecution = (cycleId, issueId, callback) => {
        popsicle.request({
            method: 'POST',
            url: options.zapiUrl + '/execution',
            body: {
                cycleId,
                issueId,
                projectId: options.projectId
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .use(popsicle.plugins.parse('json'))
            .use(auth(options.jiraUser, options.jiraPassword))
            .then((res) => {
                callback(Object.keys(res.body)[0]);
            })
            .catch(function(error) {
                console.error(error);
            });

    };


    this.getStepId = (executionId, stepId, callback) => {
        popsicle.request({
            method: 'GET',
            url: options.zapiUrl + '/stepResult?executionId=' + executionId,
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .use(popsicle.plugins.parse('json'))
            .use(auth(options.jiraUser, options.jiraPassword))
            .then((res) => {
                for (let step of res.body) {
                    if (String(step.stepId) === stepId) {
                        callback(step.id);
                        break;
                    }
                }
            })
            .catch(function(error) {
                console.error(error);
            });
    };

    this.updateTestStep = (stepId, status, callback) => {
        popsicle.request({
            method: 'PUT',
            url: options.zapiUrl + '/stepResult/' + stepId,
            body: {
                status,
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .use(popsicle.plugins.parse('json'))
            .use(auth(options.jiraUser, options.jiraPassword))
            .then(() => {
                callback();
            })
            .catch(function(error) {
                console.error(error);
            });
    };

    this.updateExecution = (executionId, status, callback) => {
        popsicle.request({
            method: 'PUT',
            url: options.zapiUrl + '/execution/' + executionId + '/execute',
            body: {
                status
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .use(popsicle.plugins.parse('json'))
            .use(auth(options.jiraUser, options.jiraPassword))
            .then(() => {
                callback();
            })
            .catch(function(error) {
                console.error(error);
            });
    };

    this.addAttachmentBuffered = (stepId, img, callback) => {
        const entityType = 'STEPRESULT';
        const form = popsicle.form();
        form.append('file', img, {
            filename: stepId + '_screenshot.png',
        });

        popsicle.request({
            method: 'POST',
            url: options.zapiUrl + '/attachment?entityId=' + stepId + '&entityType=' + entityType,
            body: form,
            headers: {
                'X-Atlassian-Token': 'nocheck',
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            }
        })
            .use(auth(options.jiraUser, options.jiraPassword))
            .then(() => {
                callback();
            })
            .catch(function(error) {
                console.error(error);
            });
    };

    this.addAttachment = (stepId, img, callback) => {
        const entityType = 'STEPRESULT';
        const form = popsicle.form({
            file: fs.createReadStream(img)
        });

        popsicle.request({
            method: 'POST',
            url: options.zapiUrl + '/attachment?entityId=' + stepId + '&entityType=' + entityType,
            body: form,
            headers: {
                'X-Atlassian-Token': 'nocheck',
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            }
        })
            .use(auth(options.jiraUser, options.jiraPassword))
            .then(() => {
                callback();
            })
            .catch(function(error) {
                console.error(error);
            });
    };

    return this;

};

module.exports = ZephyrService;

