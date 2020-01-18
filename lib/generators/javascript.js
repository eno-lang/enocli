const { interpolatify } = require('../utilities.js');

const transformField = (astField, astParent) => {
  // TODO: Missing differentitation between required element and required value, also elsewhere
  return interpolatify`
    ${astParent.internalKey}.${astField.internalKey} = _${astParent.internalKey}.field('${astField.key}').${astField.required ? 'required' : 'optional'}StringValue();
  `;
};

const transformFieldset = (astFieldset, astParent) => {
  return interpolatify`
    {
      const _${astFieldset.internalKey} = _${astParent.internalKey}.${astFieldset.required ? 'required' : 'optional'}Fieldset('${astFieldset.key}');
      ${astParent.internalKey}.${astFieldset.internalKey} = {};
      ${astFieldset.entries.map(astEntry => interpolatify`
        ${astParent.internalKey}.${astFieldset.internalKey}.${astEntry.internalKey} = _${astFieldset.internalKey}.entry('${astEntry.key}').${astEntry.required ? 'required' : 'optional'}StringValue();
      `).join('\n')}
    }
  `;
};

const transformList = (astList, astParent) => {
  return interpolatify`
    ${astParent.internalKey}.${astList.internalKey} = _${astParent.internalKey}.${astList.required ? 'required' : 'optional'}List('${astList.key}').requiredStringValues();
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
        ${astParent.internalKey}.${astSection.internalKey} = {};
        const _${astSection.internalKey} = _${astParent.internalKey}.${astParent.required ? 'required' : 'optional'}Section('${astSection.key}');
        const ${astSection.internalKey} = ${astParent.internalKey}.${astSection.internalKey};
        ${transformedElements}
      }
    `;
  } else {
    return interpolatify`
      const ${astSection.internalKey} = {};
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
