const fs = require('fs');

const analyze = require('./analyze.js');
const generateJavascript = require('./generators/javascript.js');
const generateSchema = require('./generators/schema.js');
const { interpolatify } = require('./utilities.js');

module.exports = (documentPath, targets) => {
  const astDocument = analyze(documentPath);

  for(const [language, outputPath] of Object.entries(targets)) {
    let code;

    switch(language) {
      case 'javascript':
        code = generateJavascript(astDocument);
        console.log(interpolatify`
          ----------
          Successfully generated javascript code at '${outputPath}'.

          *** Usage ***
          const { parse } = require('${outputPath}'); // require path might need adjustments for your project
          const result = parse('samples/basic.eno');
        `);
        break;
      case 'schema':
        code = generateSchema(astDocument);
        console.log(interpolatify`
          ----------
          Successfully generated schema definition at '${outputPath}'.

          *** Usage ***
          Edit the schema (e.g. adding/modifying annotations or changing the document structure)
          and afterwards use the schema as input to enocli to obtain updated parser code.
        `);
        break;
      default:
        console.log(`Unsupported target language '${language}'`);
        process.exit(1);
    }

    fs.writeFileSync(outputPath, code);
  }
};
