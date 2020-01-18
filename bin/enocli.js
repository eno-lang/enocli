#!/usr/bin/env node

const generate = require('../lib/generate.js');

const ARGV_MIN_COUNT = 3;
const ARGV_DOCUMENT_PATH = 2;
const ARGV_FIRST_TARGET = 3;
const ARGV_TARGET_REGEX = /^(javascript)=(.*)$/

const printUsageMessageAndQuit = error => {
  console.log(`
  ${error}

  Usage: node cli.js [DOCUMENT_PATH] [TARGET_1] [TARGET_2] ...

  DOCUMENT_PATH: Required, e.g. path/to/document.eno
  TARGET_N: E.g. javascript=output_path.js (Currently only javascript is supported, in the future python=output_path.py, etc. will be available as well)
  `.trim());
  process.exit();
}

if(process.argv.length < ARGV_MIN_COUNT) {
  printUsageMessageAndQuit(`Too few parameters (${process.argv.join(' ')})`);
}

const documentPath = process.argv[ARGV_DOCUMENT_PATH];

const targets = {};
for(let argvIndex = ARGV_FIRST_TARGET; argvIndex < process.argv.length; argvIndex++) {
  const targetSpecification = process.argv[argvIndex];
  const match = targetSpecification.match(ARGV_TARGET_REGEX);

  if(match === null) {
    printUsageMessageAndQuit(`Invalid target specification (${targetSpecification})`);
  }

  targets[match[1]] = match[2];
}

generate(documentPath, targets);
