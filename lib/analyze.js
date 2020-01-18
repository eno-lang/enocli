const enolib = require('enolib');
const fs = require('fs');
const { TerminalReporter } = require('enolib');

const { snakecasify } = require('./utilities.js');

const generateInternalKey = (key, astElements) => {
  let generatedKey = snakecasify(key)

  while(astElements.find(astElement => astElement.internalKey === generatedKey)) {
    generatedKey += '_dup';   // TODO: Intelligent numerical postfix incrementation and also
                              //       postfix the original element on the first collision.
  }

  return generatedKey;
};

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

  return {
    internalKey: generateInternalKey(key, astParent.elements),
    key,
    parent: astParent,
    required: true,
    type: 'field'
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

    astFieldset.entries.push({
      internalKey: generateInternalKey(key, astFieldset.entries),
      key,
      parent: astFieldset,
      required: true,
      type: 'entry'
    });
  }

  return astFieldset;
};

const analyzeList = (list, astParent) => {
  const key = list.stringKey();
  const astList = {
    internalKey: generateInternalKey(key, astParent.elements),
    key,
    parent: astParent,
    required: true,
    type: 'list'
  };

  // TODO: Infer things from the items found (type, required/optional, etc.)

  return astList;
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
