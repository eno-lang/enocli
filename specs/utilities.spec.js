const { camelcasify, snakecasify } = require('../lib/utilities.js');

describe('camelcasify', () => {
  it('turns a snake_case string into camelCase', () => {
    expect(camelcasify('some_case_string')).toEqual('someCaseString');
  });
});

describe('snakecasify', () => {
  it('turns an arbitrary string into snake_case', () => {
    expect(snakecasify('SoMe--CASE string?')).toEqual('some_case_string');
  });
});
