# protractor-zephyr-reporter [![npm version](https://badge.fury.io/js/protractor-zephyr-reporter.svg)](https://badge.fury.io/js/protractor-zephyr-reporter) [![Build Status](https://travis-ci.org/lukas-reineke/protractor-zephyr-reporter.svg?branch=master)](https://travis-ci.org/lukas-reineke/protractor-zephyr-reporter)

Generates [Zephyr for Jira](https://www.getzephyr.com/products/zephyr-for-jira)
test executions using
[zapi](https://marketplace.atlassian.com/plugins/com.thed.zephyr.zapi/server/overview)
for protractor tests.

# Help wanted

I don't have access to a Jira install anymore which makes testing impossible.
If someone wants to help out, I can give you access to the repo.

There won't be any updates until I find someone.

# How to use

-   Install protractor-zephyr-reporter with npm

```bash
npm install --save-dev protractor-zephyr-reporter
```

-   Update your protractor.conf.js file

```javascript
const ZephyrReporter = require('protractor-zephyr-reporter');

// Jasmine does not support promises for reporters, but protractor does for
// onPrepare and onComplete. We can use that to make the reporter async as
// well. Generate two promises on onPrepare and add them as arguments to the
// reporter.
let onPrepareDefer;
let onCompleteDefer;

exports.config = {
    specs: ['example_spec.js'],
    framework: 'jasmine2',
    directConnect: true,
    capabilities: {
        // the name is what the test cycle will be called. Default is 'no name'
        name: 'Google Chrome',
        browserName: 'chrome',
    },
    onPrepare: function() {
        // first promise is to make sure the cycle is created before the tests start.
        onPrepareDefer = protractor.promise.defer();
        // second promise is to make sure everything is done before protractor
        // quits
        onCompleteDefer = protractor.promise.defer();

        const options = {
            disabled: false,
            screenshot: 'fail',
            version: '1.0',
            projectId: 'XXX',
            boardId: 'XXX',
            jiraUser: 'XXX',
            jiraPassword: 'XXX',
            zapiUrl: 'https://jira.com/rest/zapi/latest',
            jiraUrl: 'https://jira.com/rest/agile/latest',
        };

        // add the reporter
        jasmine
            .getEnv()
            .addReporter(
                ZephyrReporter(
                    options,
                    onPrepareDefer,
                    onCompleteDefer,
                    browser,
                ),
            );

        // return the promises for onPrepare..
        return onPrepareDefer.promise;
    },
    onComplete: function() {
        // ..and onComplete
        return onCompleteDefer.promise;
    },
};
```

# Options

-   `disabled`

Set to true to disable the reporter. Default is false.

-   `screenshot`

protractor-zephyr-reporter can attach screenshots to test executions. Default
is `fail`

-   `never` Never attach screenshots
-   `fail` only attach screenshots if the test failed
-   `always` always attach screenshots

protractor-zephyr-reporter can work with
[wswebcreation/protractor-image-comparison](https://github.com/wswebcreation/protractor-image-comparison).
If you have protractor-image-comparison configured, the comparison images will also be
uploaded.

-   `boardId`

The Jira board Id. You need to board ID to create a new cycle. If no new cycle
can be created, the test will be an unscheduled execution assigned to Ad hoc.
You can get the board ID with this API call.

```bash
curl https://USERNAME:PASSWORD@jira.com/rest/agile/latest/board
```

-   `projectId` (required)

The Jira project ID.
You can get the project ID with this API call.

```bash
curl https://USERNAME:PASSWORD@jira.com/rest/agile/latest/board/BOARD-ID/project
```

-   `version`

The release version in Jira, the test will get attached to. If no version is specified,
the test will be an unscheduled execution.
The version has to exist before it is used, currently this reporter does not
create versions. You need the board ID for this to work as well.

-   `jiraUser` (required)
-   `jiraPassword` (required)
-   `zapiUrl` (required)

This is your Jira zapi url

-   `jiraUrl` (required)

This is your Jira api url

# Test Setup

A test case is represented by a describe block.
The test case ID has to be added at the end of the description with an @
symbol.
You can get the test case ID with this API call.

```bash
curl https://USERNAME:PASSWORD@jira.com/rest/agile/latest/issue/TICKET-ID
```

A test step is represented by an it block.
The test step ID has to be added at the end of the description with an @
symbol.
You can get the test step IDs with this API call.

```bash
curl https://USERNAME:PASSWORD@jira.com/rest/zapi/latest/teststep/TEST-CASE-ID
```

If you want to use image comparison, the tag has to be the same as the test
step ID.

```javascript
describe('test case description @111111', function() {
    it('should do something @222222', function() {
        expect(2).toEqual(2);
    });

    it('should do something else @333333', function() {
        expect(3).toEqual(3);
        expect(
            browser.params.imageComparison.checkElement(element, '333333'),
        ).toBeLessThan(3.5);
    });
});
```

![Jira test steps](https://github.com/lukas-reineke/protractor-zephyr-reporter/raw/master/screenshots/screenshot-1.png 'Jira test steps')

# References

#### Jira API documentation

https://docs.atlassian.com/jira-software/REST/cloud/

#### Zapi API documentaion

http://docs.getzephyr.apiary.io
