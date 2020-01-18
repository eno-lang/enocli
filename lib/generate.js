const fs = require('fs');

const analyze = require('./analyze.js');
const generateJavascript = require('./generators/javascript.js');
const { interpolatify } = require('./utilities.js');

module.exports = (documentPath, targets) => {
  const astDocument = analyze(documentPath);

  for(const [language, outputPath] of Object.entries(targets)) {
    let code;

    switch(language) {
      case 'javascript':
        code = generateJavascript(astDocument);
        break;
      default:
        console.log(`Unsupported target language '${language}'`);
        process.exit(1);
    }

    fs.writeFileSync(outputPath, code);

    console.log(interpolatify`
      Successfully generated ${language} target '${outputPath}'.

      Usage:
      -----
      const { parse } = require('${outputPath}'); // require path might need adjustments for your project
      const obj = parse('samples/basic.eno');
    `);
  }
};
