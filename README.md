# protractor-zephyr-reporter [![npm version](https://badge.fury.io/js/protractor-zephyr-reporter.svg)](https://badge.fury.io/js/protractor-zephyr-reporter)

Generates [Zephyr for Jira](https://www.getzephyr.com/products/zephyr-for-jira)
test executions using
[zapi](https://marketplace.atlassian.com/plugins/com.thed.zephyr.zapi/server/overview)
for protractor tests.


# How to use

* Install protractor-zephyr-reporter with npm

```bash
npm install --save-dev protractor-zephyr-reporter
```

* Update your protractor.conf.js file

```javascript
const ZephyrReporter = require('protractor-zephyr-reporter');

// Jasmine dose not support promises for reporters, but protractor does for
// onPrepare and onComplete. We can use that to make the reporter async as
// well. Generate two promises on onPrepare and add them as arguments to the
// reporter.
let onPrepareDefer;
let onCompleteDefer;

exports.config = {
    'specs': [
        'example_spec.js'
    ],
    'framework': 'jasmine2',
    'directConnect': true,
    'capabilities': {
        // the name is what the test cycle will be called. Default is 'no name'
        'name': 'Google Chrome',
        'browserName': 'chrome'
    },
    'onPrepare': function() {

        // first promise is to make sure the cycle is created before the tests start.
        onPrepareDefer = protractor.promise.defer();
        // second promise is to make sure everything is done before protractor
        // quits
        onCompleteDefer = protractor.promise.defer();

        const options = {
            'screenshot': 'fail',
            'version': '1.0',
            'projectId': 'XXX',
            'boardId': 'XXX',
            'jiraUser': 'XXX',
            'jiraPassword': 'XXX',
            'zapiUrl': 'https://jira.com/rest/zapi/latest',
            'jiraUrl': 'https://jira.com/rest/agile/latest'
        };

        // add the reporter
        jasmine.getEnv().addReporter(ZephyrReporter(options, onPrepareDefer, onCompleteDefer, browser));

        // return the promises for onPrepare..
        return onPrepareDefer.promise;
    },
    'onComplete': function() {
        // ..and onComplete
        return onCompleteDefer.promise;
    }
};
```

# Options
* `screenshot`

 protractor-zephyr-reporter can attach screenshots to test executions. Default
 is `fail`
 - `never`  Never attach screenshots
 - `fail`   only attach screenshots if the test failed
 - `always` always attach screenshots

 protractor-zephyr-reporter can work with
 [wswebcreation/protractor-image-comparison](https://github.com/wswebcreation/protractor-image-comparison).
 If you have protractor-image-comparison configured, the comparison images will also be
 uploaded.

* `version`

 The release version in Jira, the test will get attached to. If no version is specified,
 the test will be assigned to Ad hoc.
 The version has to exist before it is used, currently this reporter does not
 create versions.

* `projectId` (required)

 The Jira project ID.

* `boardId` (required)

 The Jira board Id

* `jiraUser` (required)
* `jiraPassword` (required)
* `zapiUrl` (required)

 The Jira zapi url

* `jiraUrl` (required)

 This is the Jira api url

