const slug = require('speakingurl');

// Used to turn keys found in the eno document into javascript-compatible form, e.g.:
// 'my_funny_field?' => 'myFunnyField'
// 'My funny field!' => 'myFunnyField'
exports.attributify = string => slug(string, { titleCase: true })
                                 .replace(/-/g, '')
                                 .replace(/^./, match => match.toLowerCase());

exports.snakecasify = string => slug(string, { separator: '_' });

exports.crop = text => {
  text = text.replace(/^\s*\n|\n\s*$/g, '');
  lines = text.split('\n');

  const depth = lines.reduce((minDepth, line) => {
    const leadingWhitespace = line.match(/^\s*(?=\S)/);

    if(leadingWhitespace) {
      const depth = leadingWhitespace[0].length;

      if(minDepth === null || depth < minDepth)
        return depth;
    }

    return minDepth;
  }, null);

  return text.split('\n').map(line => line.substr(depth)).join('\n');
};

exports.interpolatify = (strings, ...variables) => {
  let interpolated = '';

  for(const [index, string] of strings.entries()) {
    if(index === strings.length - 1) {
      interpolated += string.replace(/\n\s*$/, ''); // strip trailing empty lines
    } else {
      if(index === 0) {
        interpolated += string.replace(/^\s*\n/, ''); // strip leading empty lines
      } else {
        interpolated += string;
      }

      let variable = variables[index];

      if(typeof variable === 'string') {
        const leadingCharacters = string.match(/(^|\n)([^\n]*)$/)[2];
        const leadingSpace = ' '.repeat(leadingCharacters.length);

        variable = variable.split('\n').map((line, index) => {
          return index === 0 ? line : leadingSpace + line;
        }).join('\n');

      }

      interpolated += variable;
    }
  }

  return exports.crop(interpolated);  // TODO: Integrate hard-coded
};
