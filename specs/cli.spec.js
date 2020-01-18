const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const DOCUMENT_PATH = path.join(__dirname, 'fixtures/document.eno');
const OUTPUT_PATH = path.join(__dirname, 'temp_output/cli_output.js');

describe('CLI', () => {
  describe('generates a parser given valid arguments', () => {
    let cliOutput = [];
    let generatedCode;

    beforeAll(async () => {
      await new Promise(resolve => {
        const cli = spawn('node', ['bin/enocli.js', DOCUMENT_PATH, `javascript=${OUTPUT_PATH}`]);

        cli.stdout.on('data', data => cliOutput.push({ stdout: data.toString() }));
        cli.stderr.on('data', data => cliOutput.push({ stderr: data.toString() }));

        cli.on('close', code => {
          cliOutput.push({ code });

          generatedCode = fs.readFileSync(OUTPUT_PATH, 'utf-8');
          fs.unlinkSync(OUTPUT_PATH);

          resolve();
        });
      });
    });

    it('prints the expected stdout/stderr output', () => {
      expect(cliOutput).toMatchSnapshot();
    });

    it('generates the expected parser code', () => {
      expect(generatedCode).toMatchSnapshot();
    });
  });
});
