const path = require('path');

const analyze = require('../lib/analyze.js');

const DOCUMENT_PATH = path.join(__dirname, 'fixtures/types.eno');

describe('analyze', () => {
  it('analyzes possible value types by inference', () => {
    const astDocument = analyze(DOCUMENT_PATH);

    expect(astDocument).toMatchSnapshot();
  });
});
