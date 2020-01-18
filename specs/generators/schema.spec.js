const path = require('path');

const analyze = require('../../lib/analyze.js');
const generateSchema = require('../../lib/generators/schema.js');

const DOCUMENT_PATH = path.join(__dirname, '../fixtures/document.eno');
const SECTIONS_DOCUMENT_PATH = path.join(__dirname, '../fixtures/sections.eno');

describe('generateSchema', () => {
  it('generates a schema from an abstract syntax tree', () => {
    const astDocument = analyze(DOCUMENT_PATH);
    const schema = generateSchema(astDocument);

    expect(schema).toMatchSnapshot();
  });

  it('correctly exports section depths', () => {
    const astDocument = analyze(SECTIONS_DOCUMENT_PATH);
    const schema = generateSchema(astDocument);

    expect(schema).toMatchSnapshot();
  });
});
