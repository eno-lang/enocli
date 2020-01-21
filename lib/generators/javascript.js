const { camelcasify, escapeSingleQuotes, interpolatify } = require('../utilities.js');

// TODO: If elements are optional we actually also need to generate if branches
//       to not possibly call further methods on null (incomplete implementation!)

const transformEmpty = (astEmpty, astParent) => {
  // TODO: Empties have no value, currently we assign truthyness according to element presence,
  //       other ways to treat/deserialize it will be necessary - bit tricky, needs thought.
  return interpolatify`
    ${camelcasify(astParent.internalKey)}.${camelcasify(astEmpty.internalKey)} = _${camelcasify(astParent.internalKey)}.${astEmpty.elementRequired ? 'required' : 'optional'}Empty('${escapeSingleQuotes(astEmpty.key)}') !== null;
  `;
};

const transformField = (astField, astParent) => {
  return interpolatify`
    ${camelcasify(astParent.internalKey)}.${camelcasify(astField.internalKey)} = _${camelcasify(astParent.internalKey)}.${astField.elementRequired ? 'required' : 'optional'}Field('${escapeSingleQuotes(astField.key)}').${camelcasify(`${astField.valueRequired ? 'required' : 'optional'}_${astField.valueTypes[0].name}`)}Value();
  `;
};

const transformFieldset = (astFieldset, astParent) => {
  return interpolatify`
    {
      const _${camelcasify(astFieldset.internalKey)} = _${camelcasify(astParent.internalKey)}.${astFieldset.elementRequired ? 'required' : 'optional'}Fieldset('${escapeSingleQuotes(astFieldset.key)}');
      ${camelcasify(astParent.internalKey)}.${camelcasify(astFieldset.internalKey)} = {};
      ${astFieldset.entries.map(astEntry => interpolatify`
        ${camelcasify(astParent.internalKey)}.${camelcasify(astFieldset.internalKey)}.${camelcasify(astEntry.internalKey)} = _${camelcasify(astFieldset.internalKey)}.${astEntry.elementRequired ? 'required' : 'optional'}Entry('${escapeSingleQuotes(astEntry.key)}').${camelcasify(`${astEntry.valueRequired ? 'required' : 'optional'}_${astEntry.valueTypes[0].name}`)}Value();
      `).join('\n')}
    }
  `;
};

const transformList = (astList, astParent) => {
  return interpolatify`
    ${camelcasify(astParent.internalKey)}.${camelcasify(astList.internalKey)} = _${camelcasify(astParent.internalKey)}.${astList.elementRequired ? 'required' : 'optional'}List('${escapeSingleQuotes(astList.key)}').${camelcasify(`${astList.valuesRequired ? 'required' : 'optional'}_${astList.valueTypes[0].name}`)}Values();
  `;
};

const transformSection = (astSection, astParent) => {
  let transformedElements = astSection.elements.map(astElement => {
    switch(astElement.elementType) {
      case 'empty':
        return transformEmpty(astElement, astSection);
      case 'field':
        return transformField(astElement, astSection);
      case 'fieldset':
        return transformFieldset(astElement, astSection);
      case 'list':
        return transformList(astElement, astSection);
      case 'section':
        return transformSection(astElement, astSection);
    }
  }).join('\n');

  if(astParent) {
    return interpolatify`
      {
        ${camelcasify(astParent.internalKey)}.${camelcasify(astSection.internalKey)} = {};
        const _${camelcasify(astSection.internalKey)} = _${camelcasify(astParent.internalKey)}.${astParent.elementRequired ? 'required' : 'optional'}Section('${escapeSingleQuotes(astSection.key)}');
        const ${camelcasify(astSection.internalKey)} = ${camelcasify(astParent.internalKey)}.${camelcasify(astSection.internalKey)};
        ${transformedElements}
      }
    `;
  } else {
    return interpolatify`
      const ${camelcasify(astSection.internalKey)} = {};
      ${transformedElements}
    `;
  }
};


module.exports = astDocument => {
  const transformed = transformSection(astDocument);

  return interpolatify`
    const enolib = require('enolib');
    const enotype = require('enotype');
    const fs = require('fs');

    enolib.register(enotype);

    exports.parse = path => {
      const input = fs.readFileSync(path, 'utf-8');
      const _document = enolib.parse(input, { source: path });

      ${transformed}

      return document;
    };
  `;
};
