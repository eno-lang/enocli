const enolib = require('enolib');
const enotype = require('enotype');
const fs = require('fs');
const { TerminalReporter } = require('enolib');

const { snakecasify } = require('./utilities.js');

const PRIORITIZED_TYPES = [
  { name: 'boolean', placeholder: 'true (e.g.)', loader: enotype.boolean },
  { name: 'integer', placeholder: '14 (e.g.)', loader: enotype.integer },
  { name: 'float', placeholder: '4.83 (e.g.)', loader: enotype.float },
  { name: 'date', placeholder: '2020-01-01 (e.g.)', loader: enotype.date },
  { name: 'datetime', placeholder: '1997-07-07T13:15:30Z (e.g.)', loader: enotype.datetime },
  { name: 'url', placeholder: 'https://eno-lang.org (e.g.)', loader: enotype.url },
  { name: 'email', placeholder: 'jane.doe@eno-lang.org (e.g.)', loader: enotype.email },
  { name: 'ipv4', placeholder: '192.168.62.27 (e.g.)', loader: enotype.ipv4 },
  { name: 'color', placeholder: '#fff (e.g.)', loader: enotype.color },
  { name: 'lat_lng', placeholder: '48.205870, 16.413690 (e.g.)', loader: enotype.latLng },
  { name: 'json', placeholder: '{ "key": "value" } (e.g.)', loader: enotype.json }
];

const STRING_TYPE = { name: 'string', placeholder: 'Lorem Ipsum (e.g.)', loader: value => value };

const generateInternalKey = (key, astElements) => {
  let generatedKey = snakecasify(key)

  while(astElements.find(astElement => astElement.internalKey === generatedKey)) {
    generatedKey += '_dup';   // TODO: Intelligent numerical postfix incrementation and also
                              //       postfix the original element on the first collision.
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
  const key = empty.stringKey();

  return {
    internalKey: generateInternalKey(key, astParent.elements),
    key,
    parent: astParent,
    required: true,
    type: 'empty'
  };
};

const analyzeField = (field, astParent) => {
  const key = field.stringKey();
  const value = field.optionalStringValue();
  const valueTypes = inferTypes(value);

  return {
    internalKey: generateInternalKey(key, astParent.elements),
    key,
    parent: astParent,
    required: true,
    type: 'field',
    valueRequired: value !== null,
    valueTypes
  };
};

const analyzeFieldset = (fieldset, astParent) => {
  const key = fieldset.stringKey();
  const astFieldset = {
    entries: [],
    internalKey: generateInternalKey(key, astParent.elements),
    key,
    parent: astParent,
    required: true,
    type: 'fieldset'
  };

  for(const entry of fieldset.entries()) {
    const key = entry.stringKey();
    const value = entry.optionalStringValue();
    const valueTypes = inferTypes(value);

    astFieldset.entries.push({
      internalKey: generateInternalKey(key, astFieldset.entries),
      key,
      parent: astFieldset,
      required: true,
      type: 'entry',
      valueRequired: value !== null,
      valueTypes
    });
  }

  return astFieldset;
};

const analyzeList = (list, astParent) => {
  const key = list.stringKey();
  let valuesRequired = true;
  let valueTypes = null;

  for(const value of list.optionalStringValues()) {
    if(value === null) {
      valuesRequired = false;
    } else if(valueTypes === null) {
      valueTypes = inferTypes(value);
    } else {
      const newValueTypes = inferTypes(value);

      valueTypes = valueTypes.filter(type => newValueTypes.includes(type));
    }
  }

  return {
    internalKey: generateInternalKey(key, astParent.elements),
    key,
    parent: astParent,
    required: true,
    type: 'list',
    valuesRequired,
    valueTypes: valueTypes || ['string']
  };
};

const analyzeSection = (section, astParent) => {
  const astSection = {
    elements: [],
    required: true,
    type: 'section'
  };

  if(astParent) {
    astSection.key = section.stringKey();
    astSection.internalKey = generateInternalKey(astSection.key, astParent.elements);
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
