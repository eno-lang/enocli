const path = require('path');

const analyze = require('../lib/analyze.js');

const DOCUMENT_PATH = path.join(__dirname, 'fixtures/document.eno');

describe('analyze', () => {
  it('builds an abstract syntax tree from a document', () => {
    const astDocument = analyze(DOCUMENT_PATH);

    expect(astDocument).toMatchSnapshot();
  });
});
