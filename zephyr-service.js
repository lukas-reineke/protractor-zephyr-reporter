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

    this.createCycle = (name, callback, errorCallback) => {

        let promises = [];
        const _createCycle = (response) => {
            popsicle.request({
                method: 'POST',
                url: options.zapiUrl + '/cycle',
                body: {
                    name,
                    startDate: getDate(),
                    endDate: getDate(),
                    projectId: options.projectId,
                    versionId: response[1] || '-1',
                    sprintId: response[0] || '-1'
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': options.jwtToken,
                    'zapiAccessKey': options.zapiAccessKey
                }
            })
                .use([
                    popsicle.plugins.parse('json'),
                    ...(!options.jwtToken ? [ auth(options.jiraUser, options.jiraPassword) ] : [])
                ])
                .then((res) => {
                    callback(res.body.id);
                })
                .catch((error) => {
                    errorCallback(error);
                });
        };

        if (options.boardId && options.version) {
            promises = [
                'getActiveSprintId',
                'getVersionId'
            ];
        } else if (options.boardId) {
            promises = [
                'getActiveSprintId'
            ];
        }

        if (promises.length > 0) {
            Promise.all(promises.map((func) => {
                return JiraService[func]();
            }))
                .then((response) => {
                    _createCycle(response);
                });
        } else {
            _createCycle([-1, -1]);
        }

    };

    this.createExecution = (cycleId, issueId, callback, errorCallback) => {
        popsicle.request({
            method: 'POST',
            url: options.zapiUrl + '/execution',
            body: {
                cycleId,
                issueId,
                projectId: options.projectId
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': options.jwtToken,
                'zapiAccessKey': options.zapiAccessKey
            }
        })
            .use([
                popsicle.plugins.parse('json'),
                ...(!options.jwtToken ? [ auth(options.jiraUser, options.jiraPassword) ] : [])
            ])
            .then((res) => {
                callback(Object.keys(res.body)[0]);
            })
            .catch((error) => {
                errorCallback(error);
            });

    };


    this.getStepId = (executionId, stepId, callback, errorCallback) => {
        popsicle.request({
            method: 'GET',
            url: (() => {
                if (options.jwtToken) {
                    return options.zapiUrl + '/stepresult/search?executionId=' + executionId;
                }
                return options.zapiUrl + '/stepResult?executionId=' + executionId;
            })(),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': options.jwtToken,
                'zapiAccessKey': options.zapiAccessKey
            }
        })
            .use([
                popsicle.plugins.parse('json'),
                ...(!options.jwtToken ? [ auth(options.jiraUser, options.jiraPassword) ] : [])
            ])
            .then((res) => {
                if (options.jwtToken) {
                    res.body = res.body.stepResults;
                } else {
                    res.body = (res.body.length ? res.body : [ res.body ]);
                }
                let found = false;
                for (let step of res.body) {
                    if (String(step.stepId) === stepId) {
                        found = true;
                        callback(step.id);
                        break;
                    }
                }
                if (!found) {
                    errorCallback(`spec ${stepId} not found`);
                }
            })
            .catch((error) => {
                errorCallback(error);
            });
    };

    this.updateTestStep = (stepId, status, callback) => {
        console.log('updateTestStep');
        popsicle.request({
            method: 'PUT',
            url: (() => {
                if (options.jwtToken) {
                    return options.zapiUrl + '/stepresult/' + stepId;
                }
                return options.zapiUrl + '/stepResult/' + stepId;
            })(),
            body: (() => {
                if (options.jwtToken) {
                    return { status };
                }
                return { status: { id: status } };
            })(),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': options.jwtToken,
                'zapiAccessKey': options.zapiAccessKey
            }
        })
            .use([
                popsicle.plugins.parse('json'),
                ...(!options.jwtToken ? [ auth(options.jiraUser, options.jiraPassword) ] : [])
            ])
            .then(() => {
                callback();
            })
            .catch((error) => {
                throw new Error(error);
            });
    };

    this.updateExecution = (executionId, status, callback, errorCallback) => {
        popsicle.request({
            method: 'PUT',
            url: (() => {
                if (options.jwtToken) {
                    return options.zapiUrl + '/execution/' + executionId;
                }
                return options.zapiUrl + '/execution/' + executionId + '/execute';
            })(),
            body: (() => {
                if (options.jwtToken) {
                    return { status };
                }
                return { status: { id: status } };
            })(),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': options.jwtToken,
                'zapiAccessKey': options.zapiAccessKey
            }
        })
            .use([
                popsicle.plugins.parse('json'),
                ...(!options.jwtToken ? [ auth(options.jiraUser, options.jiraPassword) ] : [])
            ])
            .then(() => {
                callback();
            })
            .catch((error) => {
                errorCallback(error);
            });
    };

    this.addAttachmentBuffered = (stepId, img, callback, errorCallback) => {
        const entityType = 'STEPRESULT';
        const form = popsicle.form();
        form.append('file', img, {
            filename: stepId + '_screenshot.png'
        });

        popsicle.request({
            method: 'POST',
            url: options.zapiUrl + '/attachment?entityId=' + stepId + '&entityType=' + entityType,
            body: form,
            headers: {
                'X-Atlassian-Token': 'nocheck',
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
                'Authorization': options.jwtToken,
                'zapiAccessKey': options.zapiAccessKey
            }
        })
            .use([
                ...(!options.jwtToken ? [ auth(options.jiraUser, options.jiraPassword) ] : [])
            ])
            .then(() => {
                callback();
            })
            .catch((error) => {
                errorCallback(error);
            });
    };

    this.addAttachment = (stepId, img, callback, errorCallback) => {
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
                'Accept': 'application/json',
                'Authorization': options.jwtToken,
                'zapiAccessKey': options.zapiAccessKey
            }
        })
            .use([
                ...(!options.jwtToken ? [ auth(options.jiraUser, options.jiraPassword) ] : [])
            ])
            .then(() => {
                callback();
            })
            .catch((error) => {
                errorCallback(error);
            });
    };

    return this;

};

module.exports = ZephyrService;

