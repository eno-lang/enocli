const path = require('path');

const analyze = require('../../lib/analysis/analyze.js');
const generateJavascript = require('../../lib/generators/javascript.js');

const DOCUMENT_PATH = path.join(__dirname, '../fixtures/document.eno');
const TYPES_DOCUMENT_PATH = path.join(__dirname, '../fixtures/types.eno');

describe('generateJavascript', () => {
  it('generates javascript code from an abstract syntax tree', () => {
    const astDocument = analyze(DOCUMENT_PATH);
    const javascript = generateJavascript(astDocument);

    expect(javascript).toMatchSnapshot();
  });

  it('correctly exports inferred types', () => {
    const astDocument = analyze(TYPES_DOCUMENT_PATH);
    const javascript = generateJavascript(astDocument);

    expect(javascript).toMatchSnapshot();
  });
});
