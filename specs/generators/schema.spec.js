const path = require('path');

const analyze = require('../../lib/analyze.js');
const generateSchema = require('../../lib/generators/schema.js');

const DOCUMENT_PATH = path.join(__dirname, '../fixtures/document.eno');

describe('generateSchema', () => {
  it('generates a schema from an abstract syntax tree', () => {
    const astDocument = analyze(DOCUMENT_PATH);
    const schema = generateSchema(astDocument);

    expect(schema).toMatchSnapshot();
  });
});
