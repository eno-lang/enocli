const { PRIORITIZED_TYPES } = require('./types.js');

// Match an annotation directive, e.g.:
// '@key integer my_key_label'
// '@value required string my_value_label'
const ANNOTATION_REGEX = /^\s*(@\S+)(?:\s+(\S+)(?:\s+(\S+)(?:\s+(\S+))?)?)?$/;
const ANNOTATION_SUBJECT = 1;

module.exports = value => {
  const lines = value.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/);
  const result = {};

  for(const line of lines) {
    const annotation = line.match(ANNOTATION_REGEX);

    if(annotation === null) continue;

    if(annotation[ANNOTATION_SUBJECT] === '@element') {
      const elementRequired = annotation[2]; // @element [necessity]

      if(elementRequired === 'required') {
        result.elementRequired = true;
      } else if(elementRequired === 'optional') {
        result.elementRequired = false;
      } else {
        throw `Missing or invalid necessity in annotation '${annotation}' (possible forms are '@element required' or '@element optional')`;
      }
    } else if(annotation[ANNOTATION_SUBJECT] === '@key') {
      const keyType = annotation[2];    // @key [type]   ..
      const internalKey = annotation[3]; // @key  type  [name]

      if(keyType === undefined) {
        throw `Missing type declaration in annotation '${annotation}' (should be something like '@key string' or '@key float')`;
      } else if(PRIORITIZED_TYPES.find(type => type.name === keyType) == undefined) {
        throw `Unknown type '${keyType}' in annotation '${annotation}' (available types are ${PRIORITIZED_TYPES.map(type => `'${type.name}'`).join(', ')})`;
      } else {
        result.keyType = keyType;
      }

      if(internalKey !== undefined) {
        result.internalKey = internalKey;
      }
    } else if(annotation[ANNOTATION_SUBJECT] === '@value') {
      const valueRequired = annotation[2]; // @value [necessity]   ..
      const valueType = annotation[3];     // @value  necessity  [type]   ..
      const valueName = annotation[4];     // @value  necessity   type  [name]

      if(valueRequired === 'required') {
        result.valueRequired = true;
      } else if(valueRequired === 'optional') {
        result.valueRequired = false;
      } else {
        throw `Missing or invalid necessity in annotation '${annotation}' (possible forms are '@value required' or '@value optional')`;
      }

      if(valueType === undefined) {
        throw `Missing type in annotation '${annotation}' (should be something like '@value required string' or '@value optional float')`;
      } else if(PRIORITIZED_TYPES.find(type => type.name === valueType) == undefined) {
        throw `Unknown type '${valueType}' in annotation '${annotation}' (available types are ${PRIORITIZED_TYPES.map(type => `'${type.name}'`).join(', ')})`;
      } else {
        result.valueType = valueType;
      }

      if(valueName !== undefined) {
        result.valueName = valueName;
      }
    } else if(annotation[ANNOTATION_SUBJECT] === '@values') {
      // TODO: Actually this should only be allowed on lists,
      //       need a way to ensure this here or elsewhere.

      const valuesRequired = annotation[2]; // @values [necessity]   ..
      const valuesType = annotation[3];     // @values  necessity  [type]

      if(valuesRequired === 'required') {
        result.valuesRequired = true;
      } else if(valuesRequired === 'optional') {
        result.valuesRequired = false;
      } else {
        throw `Missing or invalid necessity in annotation '${annotation}' (possible forms are '@values required' or '@values optional')`;
      }

      if(valuesType === undefined) {
        throw `Missing type in annotation '${annotation}' (should be something like '@values required string' or '@values optional float')`;
      } else if(PRIORITIZED_TYPES.find(type => type.name === valuesType) == undefined) {
        throw `Unknown type '${valuesType}' in annotation '${annotation}' (available types are ${PRIORITIZED_TYPES.map(type => `'${type.name}'`).join(', ')})`;
      } else {
        result.valuesType = valuesType;
      }
    } else if(annotation[ANNOTATION_SUBJECT] === '@comment') {
      const commentRequired = annotation[2]; // @comment [necessity]   ..
      const commentType = annotation[3];     // @comment  necessity  [type]   ..
      const commentName = annotation[4];     // @comment  necessity   type  [name]

      if(commentRequired === 'required') {
        result.commentRequired = true;
      } else if(commentRequired === 'optional') {
        result.commentRequired = false;
      } else {
        throw `Missing or invalid necessity in annotation '${annotation}' (possible forms are '@comment required' or '@comment optional')`;
      }

      if(commentType === undefined) {
        throw `Missing type in annotation '${annotation}' (should be something like '@comment required string' or '@comment optional float')`;
      } else if(PRIORITIZED_TYPES.find(type => type.name === commentType) == undefined) {
        throw `Unknown type '${commentType}' in annotation '${annotation}' (available types are ${PRIORITIZED_TYPES.map(type => `'${type.name}'`).join(', ')})`;
      } else {
        result.commentType = commentType;
      }

      if(commentName !== undefined) {
        result.commentName = commentName;
      }
    } else {
      throw `Invalid annotation subject '${annotation[ANNOTATION_SUBJECT]}' (allowed subjects are @comment, @element, @key, @value and @values)`;
    }
  }

  return result;
};
