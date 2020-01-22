const enolib = require('enolib');
const fs = require('fs');
const { TerminalReporter } = require('enolib');

const annotations = require('./annotations.js');
const { PRIORITIZED_TYPES, STRING_TYPE } = require('./types.js');
const { snakecasify } = require('../utilities.js');

enolib.register({ annotations });

const generateInternalKey = (key, astElements) => {
  let generatedKey = snakecasify(key)

  while(astElements.find(astElement => astElement.internalKey === generatedKey)) {
    const numericPostfix = generatedKey.match(/_(\d+)$/);

    if(numericPostfix) {
      const incrementedPostfix = `_${parseInt(numericPostfix[1]) + 1}`;

      generatedKey = generatedKey.replace(/_\d+$/, incrementedPostfix);
    } else {
      generatedKey += '_1';
    }
  }

  return generatedKey;
};

const inferTypes = value => {
  const prioritizedCompatibleTypes = [];

  if(value !== null) {
    for(const type of PRIORITIZED_TYPES) {
      try {
        type.loader(value);
        prioritizedCompatibleTypes.push(type);
      } catch(error) {
        /* noop (type does not match) */
      }
    }
  }

  prioritizedCompatibleTypes.push(STRING_TYPE);

  return prioritizedCompatibleTypes;
}

const analyzeEmpty = (empty, astParent) => {
  const annotations = empty.optionalAnnotationsComment() || {};
  const elementRequired = annotations.elementRequired === undefined ? true : annotations.elementRequired;
  const key = empty.stringKey();
  const internalKey = annotations.internalKey || generateInternalKey(key, astParent.elements);

  return {
    elementRequired,
    elementType: 'empty',
    internalKey,
    key,
    parent: astParent
  };
};

const analyzeField = (field, astParent) => {
  const annotations = field.optionalAnnotationsComment() || {};
  const elementRequired = annotations.elementRequired === undefined ? true : annotations.elementRequired;
  const key = field.stringKey();
  const internalKey = annotations.internalKey || generateInternalKey(key, astParent.elements);
  const value = field.optionalStringValue();
  const valueRequired = annotations.valueRequired === undefined ? value !== null : annotations.valueRequired;
  const valueTypes = annotations.valueType === undefined ? inferTypes(value) : [annotations.valueType];

  return {
    elementRequired,
    elementType: 'field',
    internalKey,
    key,
    parent: astParent,
    valueRequired,
    valueTypes
  };
};

const analyzeFieldset = (fieldset, astParent) => {
  const annotations = fieldset.optionalAnnotationsComment() || {};
  const elementRequired = annotations.elementRequired === undefined ? true : annotations.elementRequired;
  const key = fieldset.stringKey();
  const internalKey = annotations.internalKey || generateInternalKey(key, astParent.elements);

  const astFieldset = {
    elementRequired,
    elementType: 'fieldset',
    entries: [],
    internalKey,
    key,
    parent: astParent
  };

  for(const entry of fieldset.entries()) {
    const annotations = entry.optionalAnnotationsComment() || {};
    const elementRequired = annotations.elementRequired === undefined ? true : annotations.elementRequired;
    const key = entry.stringKey();
    const internalKey = annotations.internalKey || generateInternalKey(key, astFieldset.entries);
    const value = entry.optionalStringValue();
    const valueRequired = annotations.valueRequired === undefined ? value !== null : annotations.valueRequired;
    const valueTypes = annotations.valueType === undefined ? inferTypes(value) : [annotations.valueType];

    astFieldset.entries.push({
      elementRequired,
      elementType: 'entry',
      internalKey,
      key,
      parent: astFieldset,
      valueRequired,
      valueTypes
    });
  }

  return astFieldset;
};

const analyzeList = (list, astParent) => {
  const annotations = list.optionalAnnotationsComment() || {};
  const elementRequired = annotations.elementRequired === undefined ? true : annotations.elementRequired;
  const key = list.stringKey();
  const internalKey = annotations.internalKey || generateInternalKey(key, astParent.elements);
  let valuesRequired = annotations.valuesRequired === undefined ? true : annotations.valuesRequired;
  let valueTypes = annotations.valuesType === undefined ? undefined : [annotations.valuesType];

  for(const value of list.optionalStringValues()) {
    if(value === null) {
      if(annotations.valuesRequired !== undefined) {
        valuesRequired = false;
      }
    } else if(annotations.valuesType === undefined) {
      if(valueTypes === undefined) {
        valueTypes = inferTypes(value);
      } else {
        const newValueTypes = inferTypes(value);

        valueTypes = valueTypes.filter(type => newValueTypes.includes(type));
      }
    }
  }

  if(valueTypes === undefined) {
    valueTypes = ['string'];
  }

  return {
    elementRequired,
    elementType: 'list',
    internalKey,
    key,
    parent: astParent,
    valuesRequired,
    valueTypes
  };
};

const analyzeSection = (section, astParent) => {
  const annotations = section.optionalAnnotationsComment() || {};
  const elementRequired = annotations.elementRequired === undefined ? true : annotations.elementRequired;

  const astSection = {
    elementRequired,
    elements: [],
    elementType: 'section'
  };

  if(astParent) {
    astSection.key = section.stringKey();
    astSection.internalKey = annotations.internalKey || generateInternalKey(astSection.key, astParent.elements);
    astSection.parent = astParent;
  } else {
    astSection.internalKey = 'document';
  }

  for(const element of section.elements()) {
    let astElement;

    if(element.yieldsEmpty()) {
      astElement = analyzeEmpty(element.toEmpty(), astSection);
    } else if(element.yieldsField()) {
      astElement = analyzeField(element.toField(), astSection);
    } else if(element.yieldsFieldset()) {
      astElement = analyzeFieldset(element.toFieldset(), astSection);
    } else if(element.yieldsList()) {
      astElement = analyzeList(element.toList(), astSection);
    } else if(element.yieldsSection()) {
      astElement = analyzeSection(element.toSection(), astSection);
    }

    astSection.elements.push(astElement);
  }

  return astSection;
};

module.exports = documentPath => {
  const content = fs.readFileSync(documentPath, 'utf-8');

  let document;
  try {
    document = enolib.parse(content, { reporter: TerminalReporter, source: documentPath });
  } catch(error) {
    console.log(`The eno file provided is not valid:\n${error}`);
    process.exit();
  };

  return analyzeSection(document);
}
