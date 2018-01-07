const specStarted = require('../../src/zephyr-reporter-functions/spec-started');

describe(`specStarted()`, () => {

    let self;

    beforeEach(() => {
        self = {
            specPromises: [],
            specPromisesResolve: {},
            disabled: false
        }
    });


    it(`should do nothing if the reporter is disabled`, () => {

        const spec = {
            id: 666
        }

        self.disabled = true;

        specStarted.bind(self)(spec);

        expect(self.specPromises.length).toEqual(0);
        expect(Object.keys(self.specPromisesResolve).length).toEqual(0);

    });


    it(`should create a promise for the spec`, () => {

        const spec = {
            id: 666
        }

        specStarted.bind(self)(spec);

        expect(self.specPromises.length).toEqual(1);
        expect(Object.keys(self.specPromisesResolve).length).toEqual(1);

    });

});

