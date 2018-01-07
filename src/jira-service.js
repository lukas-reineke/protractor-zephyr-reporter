const popsicle = require('popsicle');
const auth = require('popsicle-basic-auth');

const JiraService = (options) => {

    this.getActiveSprintId = () => {
        return popsicle.request({
            method: 'GET',
            url: options.jiraUrl + '/board/' + options.boardId + '/sprint?state=active',
            body: {},
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .use(popsicle.plugins.parse('json'))
            .use(auth(options.jiraUser, options.jiraPassword))
            .then((res) => {
                if (res.body.values[0]) {
                    return res.body.values[0].id;
                } else {
                    console.error('no active sprint found.');
                    return '-1';
                }
            })
            .catch((error) => {
                console.error(error);
                return '-1';
            });

    };

    this.getVersionId = () => {
        return popsicle.request({
            method: 'GET',
            url: options.jiraUrl + '/board/' + options.boardId + '/version',
            body: {},
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .use(popsicle.plugins.parse('json'))
            .use(auth(options.jiraUser, options.jiraPassword))
            .then((res) => {
                const index = res.body.values.findIndex((versions) => versions.name === options.version);

                if (index === -1) {
                    console.error('no version ID found.');
                    return '-1';
                } else {
                    return res.body.values[index].id;
                }
            })
            .catch((error) => {
                console.error(error);
                return '-1';
            });
    };

    return this;

};

module.exports = JiraService;

