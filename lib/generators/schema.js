const { interpolatify } = require('../utilities.js');

const transformEmpty = (astEmpty, astParent) => {
  return interpolatify`
    @element required
    @key string ${astEmpty.internalKey}
    ${astEmpty.key}
  `;
};

const transformField = (astField, astParent) => {
  return interpolatify`
    @element required
    @key string ${astField.internalKey}
    @value ${astField.valueRequired ? 'required' : 'optional'} string
    ${astField.key}: value
  `;
};

const transformFieldset = (astFieldset, astParent) => {
  return interpolatify`
    @element required
    @key string ${astFieldset.internalKey}
    ${astFieldset.key}:

    ${astFieldset.entries.map(astEntry => interpolatify`
      @element required
      @key string ${astEntry.internalKey}
      @value ${astEntry.valueRequired ? 'required' : 'optional'} string
      ${astEntry.key}: value
    `).join('\n\n')}
  `;
};

const transformList = (astList, astParent) => {
  // TODO: Exporting items as well in some way and with some purpose
  return interpolatify`
    @element required
    @key string ${astList.internalKey}
    @values ${astList.valuesRequired ? 'required' : 'optional'} string
    ${astList.key}:
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
  }).join('\n\n');

  if(astParent) {
    // TODO: Section depth is not known/respected and therefore wrong right now
    return interpolatify`
      @element required
      @key string ${astSection.internalKey}
      # ${astSection.key}
      ${transformedElements}
    `;
  } else {
    return transformedElements;
  }
};

module.exports = astDocument => transformSection(astDocument);
