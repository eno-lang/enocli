const { camelcasify, interpolatify } = require('../utilities.js');

const transformField = (astField, astParent) => {
  // TODO: Missing differentitation between required element and required value, also elsewhere
  return interpolatify`
    ${camelcasify(astParent.internalKey)}.${camelcasify(astField.internalKey)} = _${camelcasify(astParent.internalKey)}.field('${astField.key}').${astField.required ? 'required' : 'optional'}StringValue();
  `;
};

const transformFieldset = (astFieldset, astParent) => {
  return interpolatify`
    {
      const _${camelcasify(astFieldset.internalKey)} = _${camelcasify(astParent.internalKey)}.${astFieldset.required ? 'required' : 'optional'}Fieldset('${astFieldset.key}');
      ${camelcasify(astParent.internalKey)}.${camelcasify(astFieldset.internalKey)} = {};
      ${astFieldset.entries.map(astEntry => interpolatify`
        ${camelcasify(astParent.internalKey)}.${camelcasify(astFieldset.internalKey)}.${camelcasify(astEntry.internalKey)} = _${camelcasify(astFieldset.internalKey)}.entry('${astEntry.key}').${astEntry.required ? 'required' : 'optional'}StringValue();
      `).join('\n')}
    }
  `;
};

const transformList = (astList, astParent) => {
  return interpolatify`
    ${camelcasify(astParent.internalKey)}.${camelcasify(astList.internalKey)} = _${camelcasify(astParent.internalKey)}.${astList.required ? 'required' : 'optional'}List('${astList.key}').requiredStringValues();
  `;
};

const transformSection = (astSection, astParent) => {
  let transformedElements = astSection.elements.map(astElement => {
    switch(astElement.type) {
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
    // TODO: If the section is optional we actually also need to generate an if branch in the generated code here to catch that
    // TODO: Single quotes in keys (those facing the user in the document need to be escaped everywhere)
    return interpolatify`
      {
        ${camelcasify(astParent.internalKey)}.${camelcasify(astSection.internalKey)} = {};
        const _${camelcasify(astSection.internalKey)} = _${camelcasify(astParent.internalKey)}.${astParent.required ? 'required' : 'optional'}Section('${astSection.key}');
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
    const fs = require('fs');

    exports.parse = path => {
      const input = fs.readFileSync(path, 'utf-8');
      const _document = enolib.parse(input, { source: path });

      ${transformed}

      return document;
    };
  `;
};
