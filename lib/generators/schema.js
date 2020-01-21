const { interpolatify } = require('../utilities.js');

const transformEmpty = (astEmpty, astParent) => {
  return interpolatify`
    @element ${astEmpty.elementRequired ? 'required' : 'optional'}
    @key string ${astEmpty.internalKey}
    ${astEmpty.key}
  `;
};

const transformField = (astField, astParent) => {
  return interpolatify`
    @element ${astField.elementRequired ? 'required' : 'optional'}
    @key string ${astField.internalKey}
    @value ${astField.valueRequired ? 'required' : 'optional'} ${astField.valueTypes[0].name}
    ${astField.key}: ${astField.valueTypes[0].placeholder}
  `;
};

const transformFieldset = (astFieldset, astParent) => {
  return interpolatify`
    @element ${astFieldset.elementRequired ? 'required' : 'optional'}
    @key string ${astFieldset.internalKey}
    ${astFieldset.key}:

    ${astFieldset.entries.map(astEntry => interpolatify`
      @element ${astEntry.elementRequired ? 'required' : 'optional'}
      @key string ${astEntry.internalKey}
      @value ${astEntry.valueRequired ? 'required' : 'optional'} ${astEntry.valueTypes[0].name}
      ${astEntry.key}: ${astEntry.valueTypes[0].placeholder}
    `).join('\n\n')}
  `;
};

const transformList = (astList, astParent) => {
  return interpolatify`
    @element ${astList.elementRequired ? 'required' : 'optional'}
    @key string ${astList.internalKey}
    @values ${astList.valuesRequired ? 'required' : 'optional'} ${astList.valueTypes[0].name}
    ${astList.key}:
    - ${astList.valueTypes[0].placeholder}${astList.valuesRequired ? '' : '\n- '}
  `;
};

const transformSection = (astSection, astParent, depth = 0) => {
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
        return transformSection(astElement, astSection, depth + 1);
    }
  }).join('\n\n');

  if(astParent) {
    return interpolatify`
      @element ${astSection.elementRequired ? 'required' : 'optional'}
      @key string ${astSection.internalKey}
      ${'#'.repeat(depth)} ${astSection.key}
      ${transformedElements}
    `;
  } else {
    return transformedElements;
  }
};

module.exports = astDocument => transformSection(astDocument);
