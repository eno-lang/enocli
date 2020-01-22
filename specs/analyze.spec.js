const path = require('path');

const analyze = require('../lib/analysis/analyze.js');

const DOCUMENT_PATH = path.join(__dirname, 'fixtures/document.eno');
const SECTIONS_DOCUMENT_PATH = path.join(__dirname, 'fixtures/sections.eno');

describe('analyze', () => {
  it('builds an abstract syntax tree from a document', () => {
    const astDocument = analyze(DOCUMENT_PATH);

    expect(astDocument).toMatchSnapshot();
  });

  it('builds an abstract syntax tree from a section-heavy document', () => {
    const astDocument = analyze(SECTIONS_DOCUMENT_PATH);

    expect(astDocument).toMatchSnapshot();
  });
});
