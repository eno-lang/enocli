const path = require('path');

const analyze = require('../lib/analysis/analyze.js');

const DOCUMENT_PATH = path.join(__dirname, 'fixtures/annotations.eno');

describe('analyze', () => {
  it('parses and acts on annotation comments', () => {
    const astDocument = analyze(DOCUMENT_PATH);

    expect(astDocument).toMatchSnapshot();
  });
});
